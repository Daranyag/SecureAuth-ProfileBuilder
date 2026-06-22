with open('frontend/src/pages/ProfileBuilder.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('style={ background: "transparent"', 'style={{ background: "transparent"')
content = content.replace('fontFamily: "inherit" } /></label>', 'fontFamily: "inherit" }} /></label>')

with open('frontend/src/pages/ProfileBuilder.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
