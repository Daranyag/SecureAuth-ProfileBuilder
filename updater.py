import re

with open('frontend/src/pages/ProfileBuilder.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add handleLabelChange if not already present
func_to_add = '''
  const handleLabelChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      labels: {
        ...(prev.labels || {}),
        [name]: value
      }
    }));
  };
'''
if 'const handleLabelChange' not in content:
    content = content.replace('const handleChange = (e) => {', func_to_add + '\n  const handleChange = (e) => {')

def replacer(match):
    label_start = match.group(1)
    label_text = match.group(2)
    label_end = match.group(3)
    input_tag = match.group(4)
    name_match = re.search(r'name=\"([a-zA-Z0-9_]+)\"', input_tag)
    if not name_match:
        return match.group(0)
    name = name_match.group(1)
    
    if '<input' in label_text:
        return match.group(0) # already replaced
        
    new_label_content = f'<input type=\"text\" name=\"{name}\" value={{(p.labels && p.labels.{name}) || \"{label_text}\"}} onChange={{handleLabelChange}} style={{ background: \"transparent\", border: \"none\", borderBottom: \"1px dashed #9ca3af\", color: \"inherit\", fontSize: \"inherit\", padding: 0, outline: \"none\", width: \"100%\", fontFamily: \"inherit\" }} />'
    
    return f'{label_start}{new_label_content}{label_end}\\n{input_tag}'

pattern = re.compile(r'(<label[^>]*>)([^<]+)(</label>)\s*(<input[^>]+>|<select[^>]+>|<textarea[^>]+>)')
content = pattern.sub(replacer, content)

get_available_fields_old = '''    const map = {
      fullName: 'Name', age: 'Age', gender: 'Gender',
      villageCity: 'City', district: 'District', state: 'State', country: 'Country',
      highestQualification: 'Qualification', department: 'Department', collegeName: 'College Name',
      graduationYear: 'Graduation Year', cgpaPercentage: 'CGPA',
      occupation: 'Occupation', companyName: 'Company Name', experience: 'Experience',
      areaOfInterest: 'Area of Interest', certifications: 'Certifications',
      careerGoal: 'Career Goal', dreamJobRole: 'Dream Company',
      familyBackground: 'Family Background', fatherName: 'Father Name', motherName: 'Mother Name', siblings: 'Siblings',
      technicalSkills: 'Technical Skills', softSkills: 'Soft Skills', languagesKnown: 'Languages Known', portfolioLink: 'Portfolio Link',
      hobbies: 'Hobbies',
    };
    Object.keys(map).forEach(key => {
      if (profileData[key]) fields.push(map[key]);
    });'''

get_available_fields_new = '''    const map = {
      fullName: 'Full Name', age: 'Age', gender: 'Gender',
      villageCity: 'Village / City', district: 'District', state: 'State', country: 'Country',
      highestQualification: 'Qualification', department: 'Department', collegeName: 'School / College Name',
      graduationYear: 'Graduation Year', cgpaPercentage: 'Current CGPA / Marks',
      occupation: 'Occupation / Current Role', companyName: 'Company Name', experience: 'Experience',
      areaOfInterest: 'Area of Interest', certifications: 'Certifications',
      careerGoal: 'Career Goal', dreamJobRole: 'Dream Company / Role',
      familyBackground: 'Family Background', fatherName: 'Father Name', motherName: 'Mother Name', siblings: 'Siblings',
      technicalSkills: 'Technical Skills', softSkills: 'Soft Skills', languagesKnown: 'Languages Known', portfolioLink: 'Portfolio Link',
      hobbies: 'Hobbies',
    };
    Object.keys(map).forEach(key => {
      if (profileData[key]) {
        fields.push((profileData.labels && profileData.labels[key]) || map[key]);
      }
    });'''

if get_available_fields_old in content:
    content = content.replace(get_available_fields_old, get_available_fields_new)

def replacer_card(match):
    before = match.group(1)
    label_text = match.group(2)
    after = match.group(3)
    val_part = match.group(4)
    
    if 'p.labels' in before or 'p.labels' in label_text:
        return match.group(0)

    var_match = re.search(r'\{p\.([a-zA-Z0-9_]+)\}', val_part)
    if var_match:
        var_name = var_match.group(1)
        new_label = f"{{(p.labels && p.labels.{var_name}) || '{label_text}'}}:"
        return f'{before}{new_label}{after}{val_part}'
    return match.group(0)

pattern_card = re.compile(r'(<strong[^>]*>)([^<:]+):?(</strong>\s*)(<span[^>]*>\{p\.[a-zA-Z0-9_]+\}</span></div>\})')
content = pattern_card.sub(replacer_card, content)

with open('frontend/src/pages/ProfileBuilder.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
