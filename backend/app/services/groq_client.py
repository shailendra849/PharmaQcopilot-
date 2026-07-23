"""
Thin wrapper around the Groq SDK.

Two models are used deliberately:
- gemma2-9b-it            -> fast, cheap, used for the structured
                              extraction / correction JSON calls (mandatory model).
- llama-3.3-70b-versatile -> stronger reasoning, used for the risk
                              assessment narrative where quality matters more
                              than latency.
"""
import json
import re
from groq import Groq

from app.config import get_settings

settings = get_settings()
_client = Groq(api_key=settings.groq_api_key)


def _strip_code_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    return text


def call_json(system_prompt: str, user_prompt: str, model: str | None = None) -> dict:
    """
    Call Groq's chat completion API and parse the response as JSON.
    Raises ValueError if the model didn't return valid JSON.
    """
    model = model or settings.groq_model_extraction

    response = _client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content
    cleaned = _strip_code_fences(raw)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"LLM did not return valid JSON: {raw!r}") from e


def call_text(system_prompt: str, user_prompt: str, model: str | None = None) -> str:
    """Plain text completion (no JSON parsing)."""
    model = model or settings.groq_model_context

    response = _client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
    )
    return response.choices[0].message.content.strip()
