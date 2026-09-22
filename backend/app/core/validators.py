import re


def validate_password_strength(value: str) -> str:
    errors = [] 

    if len(value) < 8:
        errors.append("must be of 8 character")
    elif not re.search(r"\d", value):
        errors.append("must include a number")

    if errors:
        raise ValueError("Password " + ", ".join(errors))

    return value
