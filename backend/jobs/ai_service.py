"""
AI layer — CV Intelligence.

Handles: pulling text out of an uploaded resume file, sending it to
an LLM (NVIDIA NIM, OpenAI-compatible) for structured extraction, and
cleaning up the response into plain Python data ready to save.
"""
import json
import re
from django.conf import settings
from openai import OpenAI


class ResumeParseError(Exception):
    """Raised when a resume can't be read or the AI response isn't usable."""
    pass


def extract_text_from_file(document):
    file_path = document.file.path
    file_name = document.file_name.lower()

    if file_name.endswith('.pdf'):
        return _extract_pdf_text(file_path)
    elif file_name.endswith('.docx'):
        return _extract_docx_text(file_path)
    else:
        raise ResumeParseError(
            f"Unsupported file type for '{document.file_name}'. Only PDF and DOCX are supported."
        )


def _extract_pdf_text(file_path):
    from pypdf import PdfReader
    reader = PdfReader(file_path)
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    if not text.strip():
        raise ResumeParseError("Couldn't extract any text from this PDF — it may be a scanned image.")
    return text


def _extract_docx_text(file_path):
    import docx
    doc = docx.Document(file_path)
    text = "\n".join(p.text for p in doc.paragraphs)
    if not text.strip():
        raise ResumeParseError("Couldn't extract any text from this document.")
    return text


def _get_client():
    if not settings.NVIDIA_API_KEY:
        raise ResumeParseError("AI parsing isn't configured yet — missing NVIDIA_API_KEY.")
    return OpenAI(base_url=settings.NVIDIA_API_BASE_URL, api_key=settings.NVIDIA_API_KEY)


def _strip_code_fences(text):
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    return text.strip()


def parse_resume_text(resume_text):
    client = _get_client()

    try:
        response = client.chat.completions.create(
            model=settings.NVIDIA_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a resume parser. Extract structured data from resumes "
                        "and return ONLY valid JSON, no other text, no markdown fences."
                    ),
                },
                {
                    "role": "user",
                    "content": f"""Extract the following from this resume into JSON with this exact shape:
{{
  "skills": ["list", "of", "skills"],
  "education": [{{"degree": "...", "institution": "...", "years": "..."}}],
  "experience": [{{"title": "...", "company": "...", "duration": "...", "summary": "..."}}]
}}

Only include information that is actually present in the resume text below.
Do not invent or infer anything not explicitly stated.

Resume text:
{resume_text}
""",
                },
            ],
            temperature=0.2,
        )
    except Exception as e:
        raise ResumeParseError(f"AI request failed: {e}")

    raw_content = response.choices[0].message.content
    cleaned = _strip_code_fences(raw_content)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        raise ResumeParseError("The AI didn't return valid JSON — try again.")

    return {
        "skills": data.get("skills", []),
        "education": data.get("education", []),
        "experience": data.get("experience", []),
    }