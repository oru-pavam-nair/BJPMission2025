export interface OrgDistrictContact {
  orgDistrict: string;
  inchargeName: string;
  inchargePhone: string;
  presidentName: string;
  presidentPhone: string;
}

export const loadOrgDistrictContacts = async (): Promise<OrgDistrictContact[]> => {
  try {
    console.log('🔄 Loading org district contacts CSV...');
    const response = await fetch('/data/org_districts_contacts.csv');
    
    if (!response.ok) {
      console.error('❌ Failed to fetch CSV:', response.status, response.statusText);
      return [];
    }
    
    const csvText = await response.text();
    console.log('📄 CSV text loaded, length:', csvText.length);
    console.log('📄 First 200 chars:', csvText.substring(0, 200));
    
    const lines = csvText.trim().split('\n');
    console.log('📊 CSV lines count:', lines.length);
    const headers = lines[0].split(',');
    console.log('📋 CSV headers:', headers);
    
    const contacts = lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        orgDistrict: values[0]?.trim() || '',
        inchargeName: values[1]?.trim() || '',
        inchargePhone: values[2]?.trim() || '',
        presidentName: values[3]?.trim() || '',
        presidentPhone: values[4]?.trim() || ''
      };
    });
    
    console.log('✅ Loaded', contacts.length, 'org district contacts');
    console.log('📊 Sample contact:', contacts[0]);
    
    return contacts;
  } catch (error) {
    console.error('❌ Error loading org district contacts:', error);
    return [];
  }
};

// Function to get org district contacts by zone
export const getOrgDistrictContactsByZone = async (zone: string): Promise<any[]> => {
  const contacts = await loadOrgDistrictContacts();
  
  // Zone mapping for org districts
  const zoneMapping: { [orgDistrict: string]: string } = {
    // Thiruvananthapuram Zone
    'Kollam East': 'Thiruvananthapuram',
    'Kollam West': 'Thiruvananthapuram', 
    'Pathanamthitta': 'Thiruvananthapuram',
    'Thiruvananthapuram City': 'Thiruvananthapuram',
    'Thiruvananthapuram North': 'Thiruvananthapuram',
    'Thiruvananthapuram South': 'Thiruvananthapuram',
    
    // Alappuzha Zone
    'Alappuzha North': 'Alappuzha',
    'Alappuzha South': 'Alappuzha',
    'Idukki North': 'Alappuzha',
    'Idukki South': 'Alappuzha',
    'Kottayam East': 'Alappuzha',
    'Kottayam West': 'Alappuzha',
    
    // Ernakulam Zone
    'Ernakulam City': 'Ernakulam',
    'Ernakulam East': 'Ernakulam',
    'Ernakulam North': 'Ernakulam',
    'Thrissur City': 'Ernakulam',
    'Thrissur North': 'Ernakulam',
    'Thrissur South': 'Ernakulam',
    
    // Palakkad Zone
    'Malappuram Central': 'Palakkad',
    'Malappuram East': 'Palakkad',
    'Malappuram West': 'Palakkad',
    'Palakkad East': 'Palakkad',
    'Palakkad West': 'Palakkad',
    'Wayanad': 'Palakkad',
    
    // Kozhikode Zone
    'Kannur North': 'Kozhikode',
    'Kannur South': 'Kozhikode',
    'Kasaragod': 'Kozhikode',
    'Kozhikode City': 'Kozhikode',
    'Kozhikode North': 'Kozhikode',
    'Kozhikode Rural': 'Kozhikode'
  };
  
  // Filter contacts by zone
  const zoneContacts = contacts.filter(contact => 
    zoneMapping[contact.orgDistrict] === zone
  );
  
  // Transform to the expected format
  return zoneContacts.map(contact => ({
    name: contact.orgDistrict,
    inchargeName: contact.inchargeName,
    inchargePhone: contact.inchargePhone,
    presidentName: contact.presidentName,
    presidentPhone: contact.presidentPhone
  }));
};
