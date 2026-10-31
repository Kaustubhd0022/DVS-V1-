"""
Builds a research plan from the project's parameters (the research brief), not only from the
questions someone typed.

Deterministic parts: user and open questions always become tasks; plan depth follows the
narrative-freedom setting; search languages follow the project language; the evidence rule
follows the evidence-requirement setting. The model proposes tasks per coverage area and writes
the searches; its output is schema-checked and then cleaned here (unknown areas, duplicates,
unsupported languages).
"""

import re
from typing import Any, Dict, List, Optional

# Coverage areas the model may propose tasks for. "user_question" and "open_question" are added
# deterministically and are always allowed.
AREAS: Dict[str, str] = {
    "history_chronology": "History and chronology: dates, sequence of events, documented record",
    "people": "People: historical figures, communities, roles and relationships",
    "places_architecture": "Places and architecture: sites, buildings, geography, how places looked",
    "art_craft_material": "Art, craft and material culture: objects, techniques, tools, decoration",
    "ritual_festival_folklore": "Rituals, festivals, belief and folklore: practices, legends, oral tradition",
    "language_dialect": "Language and dialect: how people spoke, terms, names, scripts",
    "daily_life": "Daily life: food, costume, livelihoods, households, money, travel",
    "present_day_tourism": "Present day and tourism: current state of sites, access, conservation",
    "disputed_accounts": "Contested accounts: disputed dates, competing versions, myth versus record",
    "sensitivities": "Sensitivities: living communities, religious, caste, legal and political care points",
}
FIXED_AREAS = ("user_question", "open_question")

# Which brief fields a task can say it was triggered by.
PARAMETERS = [
    "premise", "subject", "themes", "genre", "tone", "setting", "era", "places", "people", "format",
    "audience", "language", "narrative_freedom", "evidence_requirement", "known_facts",
    "open_questions", "suggested_areas", "user_questions", "uploaded_material",
]

MAX_TASKS = {"FACTUAL": 30, "GROUNDED_HYBRID": 20, "CREATIVE": 12}
MAX_QUERIES = 3

DOCUMENTED_FACT_RULES = {
    "STANDARD": "Any approved source (government, UNESCO or open reference) can verify a documented fact.",
    "HIGH": "Government or UNESCO sources are preferred; without one, a documented fact needs two independent open sources.",
    "STRICT": "Government or UNESCO sources only can verify a documented fact; open sources add context but never verify it alone.",
}

# Project language names -> Wikipedia language codes used for searches.
LANGUAGE_CODES = {
    "english": "en", "hindi": "hi", "marathi": "mr", "sanskrit": "sa", "bengali": "bn", "bangla": "bn",
    "gujarati": "gu", "punjabi": "pa", "tamil": "ta", "telugu": "te", "kannada": "kn",
    "malayalam": "ml", "odia": "or", "oriya": "or", "urdu": "ur", "konkani": "gom", "assamese": "as",
}


def search_languages(language: Optional[str]) -> List[str]:
    """English first (most scholarship), then the project's languages in the order given."""
    codes = ["en"]
    for word in re.findall(r"[a-zA-Z]+", (language or "").lower()):
        code = LANGUAGE_CODES.get(word)
        if code and code not in codes:
            codes.append(code)
    return codes


def policy_for(brief: Dict[str, Any]) -> Dict[str, Any]:
    requirement = brief["evidence_requirement"]
    return {
        "evidence_requirement": requirement,
        "narrative_freedom": brief["narrative_freedom"],
        "search_order": ["primary", "secondary"],  # government and UNESCO first, always
        "documented_fact_rule": DOCUMENTED_FACT_RULES[requirement],
        "search_languages": search_languages(brief.get("language")),
        "max_tasks": MAX_TASKS[brief["narrative_freedom"]],
    }


def has_research_subject(brief: Dict[str, Any]) -> bool:
    setting = brief.get("setting") or {}
    return any([
        (brief.get("premise") or "").strip(), (brief.get("subject") or "").strip(),
        brief.get("user_questions"), brief.get("open_questions"), brief.get("people"),
        setting.get("places"), (setting.get("description") or "").strip(),
        (brief.get("uploaded_material") or "").strip(),
    ])


def _lines(label: str, values: List[str]) -> List[str]:
    return [f"{label}:"] + [f"- {v}" for v in values] if values else []


def render_brief(brief: Dict[str, Any]) -> str:
    """The brief as the model reads it. Every parameter is labelled so tasks can cite it."""
    setting = brief.get("setting") or {}
    fmt = brief.get("format") or {}
    lines = [f"Title: {brief['title']}"]
    for key, label in [("premise", "Premise"), ("subject", "Subject"), ("genre", "Genre"), ("tone", "Tone")]:
        if brief.get(key):
            lines.append(f"{label} [{key}]: {brief[key]}")
    if brief.get("themes"):
        lines.append(f"Themes [themes]: {', '.join(brief['themes'])}")

    if fmt.get("media"):
        parts = [fmt["media"]]
        if fmt.get("episode_count"):
            parts.append(f"{fmt['episode_count']} episodes")
        lines.append(f"Format [format]: {', '.join(parts)}")
    if fmt.get("audience"):
        lines.append(f"Audience [audience]: {fmt['audience']}")

    if setting.get("description"):
        lines.append(f"Setting [setting]: {setting['description']}")
    era = ", ".join(v for v in [setting.get("era"), setting.get("time_range")] if v)
    if era:
        lines.append(f"Era [era]: {era}")
    lines += _lines("Places [places]", [
        p["name"] + (f" ({p['address']})" if p.get("address") else "") for p in setting.get("places") or []
    ])
    lines += _lines("People [people]", [
        f"{p['name']} ({(p.get('role') or 'role not given') + '; '}"
        + ("historical figure: research the person" if p.get("historical") else "fictional character: research the context, not the person")
        + ")"
        for p in brief.get("people") or []
    ])
    if brief.get("language"):
        lines.append(f"Language [language]: {brief['language']}")
    lines.append(f"Narrative freedom [narrative_freedom]: {brief['narrative_freedom']}")
    lines.append(f"Evidence requirement [evidence_requirement]: {brief['evidence_requirement']}")
    lines += _lines("Already established, do not re-research [known_facts]", brief.get("known_facts") or [])
    lines += _lines("Suggested research areas [suggested_areas]", brief.get("suggested_areas") or [])
    if brief.get("uploaded_material"):
        lines.append(f"Uploaded material excerpt [uploaded_material]:\n{brief['uploaded_material']}")
    return "\n".join(lines)


def build_prompt(brief: Dict[str, Any], areas: List[str], policy: Dict[str, Any]) -> List[Dict[str, str]]:
    depth = (
        "This is a creative project: focus on texture (places, daily life, language, material culture, "
        "atmosphere) rather than establishing hard facts."
        if brief["narrative_freedom"] == "CREATIVE"
        else "This project depends on factual accuracy: cover chronology, people and places thoroughly."
        if brief["narrative_freedom"] == "FACTUAL"
        else "Balance documented facts with texture for drama."
    )
    area_lines = "\n".join(f"- {area}: {AREAS[area]}" for area in areas)
    user = f"""Plan the research for this project. Use every parameter in the brief, not only its questions.

PROJECT BRIEF
{render_brief(brief)}

COVERAGE AREAS (propose tasks only in these)
{area_lines}

RULES
- Propose at most {policy['max_tasks']} tasks. {depth}
- Each task: one specific, answerable research question; which coverage area it belongs to; a one-sentence rationale; and triggered_by, the bracketed brief parameters that led to it (for example ["places", "era"]).
- Name the people, places and period each task concerns, using names from the brief.
- Write 1 to {MAX_QUERIES} search queries per task for government, UNESCO and reference websites. Use these language codes only: {', '.join(policy['search_languages'])}. Write queries in that language's own script.
- For fictional characters, research the world around them, never the character as if real.
- Do not re-research facts listed as already established.
- Include tasks for disputed accounts and sensitivities wherever the subject involves living communities, religion, caste or contested history, if those areas are listed.
- Priority: high for what the story cannot be written without, medium for important texture, low for nice-to-have detail."""
    return [
        {"role": "system", "content": "You are a senior research producer for Indian history, culture and heritage films and series."},
        {"role": "user", "content": user},
    ]


def output_schema() -> Dict[str, Any]:
    """Any known area is schema-valid; tasks in areas the user switched off are dropped afterwards,
    so one stray task never fails the whole plan."""
    return {
        "type": "object",
        "required": ["tasks"],
        "properties": {
            "tasks": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["area", "question", "rationale", "triggered_by", "queries", "priority"],
                    "properties": {
                        "area": {"enum": list(AREAS)},
                        "question": {"type": "string", "minLength": 5},
                        "rationale": {"type": "string", "minLength": 3},
                        "triggered_by": {"type": "array", "minItems": 1, "items": {"type": "string"}},
                        "people": {"type": "array", "items": {"type": "string"}},
                        "places": {"type": "array", "items": {"type": "string"}},
                        "period": {"type": "string"},
                        "queries": {
                            "type": "array",
                            "minItems": 1,
                            "items": {
                                "type": "object",
                                "required": ["text", "language"],
                                "properties": {"text": {"type": "string", "minLength": 2}, "language": {"type": "string"}},
                            },
                        },
                        "priority": {"enum": ["high", "medium", "low"]},
                    },
                },
            }
        },
    }


def _key(question: str) -> str:
    return re.sub(r"\W+", " ", question.lower()).strip()


def assemble_tasks(brief: Dict[str, Any], areas: List[str], policy: Dict[str, Any], model_tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """User and open questions first, then the model's tasks, cleaned and capped."""
    languages = set(policy["search_languages"])
    seen = set()
    tasks: List[Dict[str, Any]] = []

    def add(task: Dict[str, Any]) -> None:
        key = _key(task["question"])
        if key and key not in seen:
            seen.add(key)
            tasks.append(task)

    for area, parameter, rationale in [
        ("user_question", "user_questions", "Asked by the project team."),
        ("open_question", "open_questions", "Listed as an open question in the project."),
    ]:
        for question in brief.get(parameter) or []:
            add({
                "area": area, "question": question.strip(), "rationale": rationale,
                "triggered_by": [parameter], "people": [], "places": [], "period": "",
                "queries": [{"text": question.strip()[:300], "language": "en"}], "priority": "high",
            })

    model_count = 0
    for task in model_tasks:
        if task.get("area") not in areas or model_count >= policy["max_tasks"]:
            continue
        queries, query_keys = [], set()
        for query in task.get("queries") or []:
            text = (query.get("text") or "").strip()[:300]
            language = query.get("language") if query.get("language") in languages else "en"
            if text and (text, language) not in query_keys:
                query_keys.add((text, language))
                queries.append({"text": text, "language": language})
        triggered = [p for p in task.get("triggered_by") or [] if p in PARAMETERS] or ["premise"]
        before = len(tasks)
        add({
            "area": task["area"],
            "question": task["question"].strip(),
            "rationale": task.get("rationale", "").strip(),
            "triggered_by": triggered,
            "people": [p for p in task.get("people") or [] if isinstance(p, str)][:10],
            "places": [p for p in task.get("places") or [] if isinstance(p, str)][:10],
            "period": (task.get("period") or "")[:200],
            "queries": queries[:MAX_QUERIES] or [{"text": task["question"].strip()[:300], "language": "en"}],
            "priority": task.get("priority") if task.get("priority") in ("high", "medium", "low") else "medium",
        })
        model_count += len(tasks) - before
    return tasks
