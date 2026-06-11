import React, { useState } from 'react';
import { AlertCircle, Save, CheckCircle, Loader2 } from 'lucide-react';

export default function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  const [statusType, setStatusType] = useState(''); 

  const [formData, setFormData] = useState({
    occupationalStatus: '', membershipCategory: '', otherCategory: '',
    lastName: '', firstName: '', nameExtension: '', middleName: '', noMiddleName: false,
    fatherName: '', motherMaidenName: '', spouseName: '', nameInBirthCert: '',
    dob: '', pob: '', sex: '', maritalStatus: '', citizenship: '',
    height: '', weight: '', facialFeatures: '',
    tin: '', sssGsis: '', crn: '', employeeId: '',
    permanentAddress: '', presentAddress: '', preferredMailing: '',
    mobile: '', homeTel: '', email: '',
    occupation: '', employmentStatus: '', employerName: '', employerAddress: '',
    officeAssignment: '', basicIncome: '', allowances: '', totalIncome: '', dateEmployed: '',
    heirs: [
      { name: '', relationship: '', dob: '' },
      { name: '', relationship: '', dob: '' },
      { name: '', relationship: '', dob: '' }
    ]
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'date' || type === 'email' ? value : value.toUpperCase())
      };
      if (name === 'noMiddleName' && checked) {
        updatedData.middleName = '';
      }
      return updatedData;
    });
  };

  const handleHeirChange = (index, field, value) => {
    const newHeirs = [...formData.heirs];
    newHeirs[index][field] = field === 'dob' ? value : value.toUpperCase();
    setFormData(prev => ({ ...prev, heirs: newHeirs }));
  };

  const calculateTotalIncome = (basic, allowances) => {
    const b = parseFloat(basic) || 0;
    const a = parseFloat(allowances) || 0;
    return (b + a).toFixed(2);
  };

  const handleIncomeChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = value.replace(/[^0-9.]/g, ''); 
    
    setFormData(prev => {
      const updated = { ...prev, [name]: sanitizedValue };
      updated.totalIncome = calculateTotalIncome(
        name === 'basicIncome' ? sanitizedValue : prev.basicIncome,
        name === 'allowances' ? sanitizedValue : prev.allowances
      );
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    // Using the current Google Apps Script deployment
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby3kluRL55JriwdE1Ey6RoLPOaC5uvTpvKXjeCfw8dgspSDHecOQnFwaSUZWxSeAOPNmQ/exec"; 

    try {
      const payload = { ...formData };
      formData.heirs.forEach((heir, index) => {
        payload[`heir${index + 1}_name`] = heir.name;
        payload[`heir${index + 1}_relationship`] = heir.relationship;
        payload[`heir${index + 1}_dob`] = heir.dob;
      });
      delete payload.heirs;

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setStatusType('success');
      setSubmitMessage('Application submitted successfully!');
    } catch (error) {
      console.error('Submission Error:', error);
      setStatusType('error');
      setSubmitMessage('Failed to submit application. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#2563eb', padding: '1.5rem', textAlign: 'center', color: 'white' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '900', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>STONE GRILL EMPLOYEE</h1>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginTop: '0.25rem' }}>PAG-IBIG MEMBERSHIP INFORMATION FORM</h2>
        </div>

        {/* Instructions */}
        <div style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #facc15', padding: '1rem', margin: '1.5rem', borderRadius: '4px', display: 'flex', alignItems: 'flex-start' }}>
          <AlertCircle color="#ca8a04" size={20} style={{ marginRight: '0.75rem', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.875rem', color: '#854d0e' }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>Important Instructions for the Applicant:</p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li><strong>Block Letters:</strong> Entries are automatically converted to CAPITAL LETTERS.</li>
              <li><strong>Middle Name:</strong> If you do not have a middle name, check the "No Middle Name" box.</li>
              <li><strong>Mandatory Fields:</strong> All fields generally required on the official form should be filled out.</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '0 1.5rem 2rem 1.5rem' }}>
          
          {/* SECTION 1 */}
          <SectionHeader number="1" title="OCCUPATIONAL STATUS & CATEGORY" />
          
          <Label>Occupational Status:</Label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {['Employed', 'Unemployed/Not Yet Employed', 'First Time Job Seeker'].map(status => (
              <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f9fafb', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'pointer' }}>
                <input type="radio" name="occupationalStatus" value={status.toUpperCase()} checked={formData.occupationalStatus === status.toUpperCase()} onChange={handleChange} />
                <span style={{ fontSize: '0.875rem' }}>{status}</span>
              </label>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <Label>Membership Category (Mandatory):</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {['Private Employee', 'Government Employee', 'Private Household', 'OFW', 'Self-Employed', 'Professional/Business Owner', 'Job Order Personnel'].map(cat => (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="radio" name="membershipCategory" value={cat.toUpperCase()} checked={formData.membershipCategory === cat.toUpperCase()} onChange={handleChange} />
                    <span style={{ fontSize: '0.875rem' }}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Membership Category (Voluntary):</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {['Foreign Gov\'t Employee', 'Non-working Spouse', 'Member of Religious Group', 'Pensioner/Investor/Lessor', 'Others'].map(cat => (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="radio" name="membershipCategory" value={cat.toUpperCase()} checked={formData.membershipCategory === cat.toUpperCase()} onChange={handleChange} />
                    <span style={{ fontSize: '0.875rem' }}>{cat === 'Others' ? 'Others:' : cat}</span>
                  </label>
                ))}
                {formData.membershipCategory === 'OTHERS' && (
                  <input type="text" name="otherCategory" placeholder="Please specify" value={formData.otherCategory} onChange={handleChange} style={{ ...inputStyle, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, marginTop: '0.5rem' }} />
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <SectionHeader number="2" title="PERSONAL DETAILS" />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div><Label>Last Name</Label><Input name="lastName" value={formData.lastName} onChange={handleChange} /></div>
            <div><Label>First Name</Label><Input name="firstName" value={formData.firstName} onChange={handleChange} /></div>
            <div><Label>Name Extension</Label><Input name="nameExtension" placeholder="JR., III" value={formData.nameExtension} onChange={handleChange} /></div>
            <div>
              <Label>Middle Name</Label>
              <Input name="middleName" value={formData.middleName} onChange={handleChange} disabled={formData.noMiddleName} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input type="checkbox" name="noMiddleName" checked={formData.noMiddleName} onChange={handleChange} />
                <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>No Middle Name</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div><Label>Father's Full Name</Label><Input name="fatherName" value={formData.fatherName} onChange={handleChange} /></div>
            <div><Label>Mother's Maiden Name</Label><Input name="motherMaidenName" value={formData.motherMaidenName} onChange={handleChange} /></div>
            <div><Label>Spouse's Full Name (if married)</Label><Input name="spouseName" value={formData.spouseName} onChange={handleChange} disabled={formData.maritalStatus !== 'MARRIED'} /></div>
            <div><Label>Name in Birth Certificate</Label><Input name="nameInBirthCert" value={formData.nameInBirthCert} onChange={handleChange} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <div><Label>Date of Birth</Label><input type="date" name="dob" value={formData.dob} onChange={handleChange} style={inputStyle} /></div>
            <div><Label>Place of Birth (City/Prov/Country)</Label><Input name="pob" value={formData.pob} onChange={handleChange} /></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginTop: '1rem' }}>
            <div>
              <Label>Sex:</Label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                {['Male', 'Female'].map(s => (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="radio" name="sex" value={s.toUpperCase()} checked={formData.sex === s.toUpperCase()} onChange={handleChange} /><span style={{ fontSize: '0.875rem' }}>{s}</span></label>
                ))}
              </div>
            </div>
            <div>
              <Label>Marital Status:</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                {['Single', 'Married', 'Widow/er', 'Annulled', 'Legally Separated'].map(ms => (
                  <label key={ms} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="radio" name="maritalStatus" value={ms.toUpperCase()} checked={formData.maritalStatus === ms.toUpperCase()} onChange={handleChange} /><span style={{ fontSize: '0.875rem' }}>{ms}</span></label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div><Label>Citizenship</Label><Input name="citizenship" value={formData.citizenship} onChange={handleChange} /></div>
            <div><Label>Height (cm)</Label><Input name="height" type="number" value={formData.height} onChange={handleChange} /></div>
            <div><Label>Weight (kg)</Label><Input name="weight" type="number" value={formData.weight} onChange={handleChange} /></div>
          </div>
          <div><Label>Prominent Facial Features</Label><Input name="facialFeatures" value={formData.facialFeatures} onChange={handleChange} /></div>

          {/* SECTION 3 */}
          <SectionHeader number="3" title="IDENTIFICATION NUMBERS" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div><Label>TIN</Label><Input name="tin" value={formData.tin} onChange={handleChange} /></div>
            <div><Label>SSS/GSIS Number</Label><Input name="sssGsis" value={formData.sssGsis} onChange={handleChange} /></div>
            <div><Label>CRN</Label><Input name="crn" placeholder="If available" value={formData.crn} onChange={handleChange} /></div>
            <div><Label>Employee ID</Label><Input name="employeeId" value={formData.employeeId} onChange={handleChange} /></div>
          </div>

          {/* SECTION 4 */}
          <SectionHeader number="4" title="ADDRESS & CONTACT DETAILS" />
          <div><Label>Permanent Address</Label><textarea name="permanentAddress" rows="2" value={formData.permanentAddress} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }}></textarea></div>
          <div style={{ marginTop: '0.5rem' }}><Label>Present Address</Label><textarea name="presentAddress" rows="2" value={formData.presentAddress} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }}></textarea></div>
          
          <div style={{ marginTop: '1rem' }}>
            <Label>Preferred Mailing Address:</Label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
               {['Present', 'Permanent', 'Employer'].map(pref => (
                  <label key={pref} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="radio" name="preferredMailing" value={pref.toUpperCase()} checked={formData.preferredMailing === pref.toUpperCase()} onChange={handleChange} /><span style={{ fontSize: '0.875rem' }}>{pref}</span></label>
                ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div><Label>Mobile Number</Label><Input name="mobile" type="tel" value={formData.mobile} onChange={handleChange} /></div>
            <div><Label>Home Telephone</Label><Input name="homeTel" type="tel" value={formData.homeTel} onChange={handleChange} /></div>
            <div><Label>Email Address</Label><input type="email" name="email" value={formData.email} onChange={handleChange} style={{ ...inputStyle, textTransform: 'none' }} /></div>
          </div>

          {/* SECTION 5 */}
          <SectionHeader number="5" title="PRESENT EMPLOYMENT DETAILS" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div><Label>Occupation/Job Title</Label><Input name="occupation" value={formData.occupation} onChange={handleChange} /></div>
            <div>
              <Label>Employment Status:</Label>
              <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} style={inputStyle}>
                <option value="">Select Status</option>
                <option value="PERMANENT">Permanent</option>
                <option value="CASUAL">Casual</option>
                <option value="CONTRACTUAL">Contractual</option>
                <option value="PROJECT-BASED">Project-based</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}><Label>Employer Name</Label><Input name="employerName" value={formData.employerName} onChange={handleChange} /></div>
            <div style={{ gridColumn: '1 / -1' }}><Label>Employer Address</Label><textarea name="employerAddress" rows="2" value={formData.employerAddress} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }}></textarea></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
             <div>
              <Label>Office Assignment:</Label>
               <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', height: '38px', alignItems: 'center' }}>
                 {['Head Office', 'Branch'].map(off => (
                    <label key={off} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><input type="radio" name="officeAssignment" value={off.toUpperCase()} checked={formData.officeAssignment === off.toUpperCase()} onChange={handleChange} /><span style={{ fontSize: '0.875rem' }}>{off}</span></label>
                  ))}
              </div>
            </div>
            <div><Label>Date Employed</Label><input type="date" name="dateEmployed" value={formData.dateEmployed} onChange={handleChange} style={inputStyle} /></div>
          </div>

          <div style={{ backgroundColor: '#f9fafb', padding: '1rem', marginTop: '1.5rem', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Monthly Income</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '150px' }}><span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>Basic (₱)</span><Input name="basicIncome" value={formData.basicIncome} onChange={handleIncomeChange} placeholder="0.00" /></div>
              <div style={{ flex: 1, minWidth: '150px' }}><span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>+ Allowances (₱)</span><Input name="allowances" value={formData.allowances} onChange={handleIncomeChange} placeholder="0.00" /></div>
              <div style={{ flex: 1, minWidth: '150px' }}><span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block' }}>= Total (₱)</span><input type="text" readOnly value={formData.totalIncome} style={{ ...inputStyle, backgroundColor: '#e5e7eb', fontWeight: 'bold' }} /></div>
            </div>
          </div>

          {/* SECTION 6 */}
          <SectionHeader number="6" title="HEIRS (BENEFICIARIES)" />
          <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem' }}>Please list legal heirs in order of succession.</p>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '2px solid #d1d5db', padding: '0.5rem', fontSize: '0.875rem' }}>Full Name</th>
                  <th style={{ borderBottom: '2px solid #d1d5db', padding: '0.5rem', fontSize: '0.875rem', width: '33%' }}>Relationship</th>
                  <th style={{ borderBottom: '2px solid #d1d5db', padding: '0.5rem', fontSize: '0.875rem', width: '25%' }}>Date of Birth</th>
                </tr>
              </thead>
              <tbody>
                {formData.heirs.map((heir, index) => (
                  <tr key={index}>
                    <td style={{ padding: '0.5rem' }}><input type="text" value={heir.name} onChange={(e) => handleHeirChange(index, 'name', e.target.value)} style={inputStyle} placeholder="Name" /></td>
                    <td style={{ padding: '0.5rem' }}><input type="text" value={heir.relationship} onChange={(e) => handleHeirChange(index, 'relationship', e.target.value)} style={inputStyle} placeholder="Relationship" /></td>
                    <td style={{ padding: '0.5rem' }}><input type="date" value={heir.dob} onChange={(e) => handleHeirChange(index, 'dob', e.target.value)} style={inputStyle} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SUBMIT BUTTON */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
             {submitMessage && (
              <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', backgroundColor: statusType === 'success' ? '#f0fdf4' : '#fef2f2', color: statusType === 'success' ? '#166534' : '#991b1b', border: `1px solid ${statusType === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
                {statusType === 'success' ? <CheckCircle size={24} style={{ marginRight: '0.75rem' }} /> : <AlertCircle size={24} style={{ marginRight: '0.75rem' }} />}
                <p style={{ margin: 0 }}>{submitMessage}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '1rem', backgroundColor: '#1d4ed8', color: 'white', fontWeight: 'bold', borderRadius: '0.5rem', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? (
                <><Loader2 className="animate-spin" size={20} style={{ marginRight: '0.5rem' }} /> Processing...</>
              ) : (
                <><Save size={20} style={{ marginRight: '0.5rem' }} /> Submit Application Data</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Inline Styles & Helper Components
const inputStyle = {
  width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '4px', 
  boxSizing: 'border-box', outline: 'none', textTransform: 'uppercase', fontFamily: 'inherit'
};

const SectionHeader = ({ title, number }) => (
  <div style={{ backgroundColor: '#1e40af', color: 'white', padding: '0.5rem', marginTop: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
    <span style={{ backgroundColor: 'white', color: '#1e40af', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem', fontSize: '0.875rem' }}>
      {number}
    </span>
    {title}
  </div>
);

const Label = ({ children }) => (
  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.25rem', marginTop: '0.75rem' }}>
    {children}
  </label>
);

const Input = ({ name, type = "text", placeholder, value, onChange, disabled }) => (
  <input
    type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled}
    style={{ ...inputStyle, backgroundColor: disabled ? '#f3f4f6' : 'white' }}
  />
);