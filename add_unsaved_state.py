import re

with open('frontend/src/pages/ProfileBuilder.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variable
if 'hasUnsavedChanges' not in content:
    content = content.replace(
        "const [introVersion, setIntroVersion] = useState(0);",
        "const [introVersion, setIntroVersion] = useState(0);\n  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);"
    )

# 2. Add setHasUnsavedChanges(true) to change handlers
handlers = [
    'const handleLabelChange = (e) => {\n    setHasUnsavedChanges(true);',
    'const handleChange = (e) => {\n    setHasUnsavedChanges(true);',
    'const addCustomField = () => {\n    setHasUnsavedChanges(true);',
    'const removeCustomField = (index) => {\n    setHasUnsavedChanges(true);',
    'const handleCustomFieldChange = (index, field, value) => {\n    setHasUnsavedChanges(true);'
]

for handler in ['handleLabelChange', 'handleChange', 'addCustomField', 'removeCustomField', 'handleCustomFieldChange']:
    if f'const {handler} = ' in content and 'setHasUnsavedChanges(true)' not in content[content.find(f'const {handler} = '):content.find(f'const {handler} = ')+100]:
        # we can just inject it at the start of the function block
        pattern = re.compile(rf'(const {handler} = [^{{]+{{\s*)')
        content = pattern.sub(r'\1setHasUnsavedChanges(true);\n    ', content, count=1)

# 3. setHasUnsavedChanges(false) on successful save
if 'setHasUnsavedChanges(false)' not in content:
    content = content.replace(
        "setMessage({ type: 'success', text: 'Profile saved successfully!' });",
        "setMessage({ type: 'success', text: 'Profile saved successfully!' });\n      setHasUnsavedChanges(false);"
    )

# 4. Update the JSX
old_jsx = '''              {(Object.keys(p).length > 0 || message.type === 'success') && (
                <>
                  <button type="button" className="btn btn-secondary"
                    onClick={handleGenerateProfileCard}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                    <Layers size={18} /> Generate Profile Card
                  </button>
                  <button type="button" className="btn btn-secondary"
                    onClick={handleGenerateIntro}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                    <UserCheck size={18} /> Generate Self Introduction
                  </button>
                </>
              )}'''

new_jsx = '''              {(Object.keys(p).length > 0 || message.type === 'success') && (
                <>
                  {hasUnsavedChanges ? (
                    <span style={{ color: 'var(--primary)', marginLeft: '16px', fontStyle: 'italic', fontWeight: '500' }}>
                      Save profile to generate
                    </span>
                  ) : (
                    <>
                      <button type="button" className="btn btn-secondary"
                        onClick={handleGenerateProfileCard}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                        <Layers size={18} /> Generate Profile Card
                      </button>
                      <button type="button" className="btn btn-secondary"
                        onClick={handleGenerateIntro}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                        <UserCheck size={18} /> Generate Self Introduction
                      </button>
                    </>
                  )}
                </>
              )}'''

content = content.replace(old_jsx, new_jsx)

with open('frontend/src/pages/ProfileBuilder.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
