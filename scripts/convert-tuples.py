#!/usr/bin/env python3
# Convert tuple order from [german, english, article?, plural?, category, frequency]
# to [german, english, category, frequency, article?, plural?]

PATH = "/home/z/my-project/src/lib/data/extended-vocab.ts"

with open(PATH, "r", encoding="utf-8") as f:
    lines = f.readlines()

def transform_tuple(content):
    # Split by commas while preserving quoted strings
    parts = []
    current = ""
    in_string = False
    quote_char = None
    i = 0
    while i < len(content):
        c = content[i]
        if not in_string and (c == '"' or c == "'"):
            in_string = True
            quote_char = c
            current += c
        elif in_string and c == quote_char:
            if i > 0 and content[i-1] == "\\":
                current += c
            else:
                in_string = False
                quote_char = None
                current += c
        elif not in_string and c == ",":
            parts.append(current.strip())
            current = ""
        else:
            current += c
        i += 1
    if current.strip():
        parts.append(current.strip())

    if len(parts) < 4:
        return None

    german = parts[0]
    english = parts[1]
    category = parts[-2]
    frequency = parts[-1]
    middle = parts[2:-2]

    article = '""'
    plural = '""'
    if len(middle) == 1:
        article = middle[0]
    elif len(middle) == 2:
        article = middle[0]
        plural = middle[1]

    return f"{german}, {english}, {category}, {frequency}, {article}, {plural}"

new_lines = []
transformed = 0
for line in lines:
    stripped = line.strip()
    if stripped.startswith("[") and (stripped.endswith("],") or stripped.endswith("]")):
        depth = 0
        start_idx = line.find("[")
        if start_idx == -1:
            new_lines.append(line)
            continue
        end_idx = -1
        in_string = False
        quote_char = None
        for i in range(start_idx, len(line)):
            c = line[i]
            if not in_string and (c == '"' or c == "'"):
                in_string = True
                quote_char = c
            elif in_string and c == quote_char and (i == 0 or line[i-1] != "\\"):
                in_string = False
                quote_char = None
            elif not in_string:
                if c == "[":
                    depth += 1
                elif c == "]":
                    depth -= 1
                    if depth == 0:
                        end_idx = i
                        break
        if end_idx == -1:
            new_lines.append(line)
            continue

        content = line[start_idx+1:end_idx]
        transformed_content = transform_tuple(content)
        if transformed_content is None:
            new_lines.append(line)
            continue

        prefix = line[:start_idx+1]
        suffix = line[end_idx:]
        new_lines.append(f"{prefix}{transformed_content}{suffix}")
        transformed += 1
    else:
        new_lines.append(line)

with open(PATH, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print(f"Transformed {transformed} entries")
