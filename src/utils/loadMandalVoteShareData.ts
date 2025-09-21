import { normalizeACName, normalizeOrgDistrictName, normalizeZoneName } from './nameNormalization';

// Utility to load Mandal-level vote share data from CSV
export interface MandalVoteShareRowData {
  Zone: string;
  'Org District': string;
  AC: string;
  'Org Mandal': string;
  '2020 LSG VS': string;
  '2020 LSG Votes': string;
  '2024 GE VS': string;
  '2024 GE Votes': string;
  '2025 LSG VS': string;
  '2025 LSG Votes': string;
}

export interface MandalVoteShareData {
  [zone: string]: {
    [orgDistrict: string]: {
      [ac: string]: {
        name: string;
        lbName: string;
        lsg2020: { vs: string; votes: string };
        ge2024: { vs: string; votes: string };
        target2025: { vs: string; votes: string };
      }[];
    };
  };
}

let mandalVoteShareDataCache: MandalVoteShareData | null = null;

export async function loadMandalVoteShareData(): Promise<MandalVoteShareData> {
  if (mandalVoteShareDataCache) {
    return mandalVoteShareDataCache;
  }

  try {
    const response = await fetch('/data/votesharetarget/Local Body Target - Org Mandal Level - Vote Share (1).csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    // Skip header lines (first 2 lines)
    const dataLines = lines.slice(2).filter(line => line.trim());
    
    const data: MandalVoteShareData = {};
    
    dataLines.forEach((line, index) => {
      const columns = line.split(',');
      if (columns.length >= 11) { // Need at least 11 columns to access column 10
        const zone = columns[0]?.trim();
        const orgDistrict = columns[1]?.trim();
        const ac = columns[2]?.trim();
        const orgMandal = columns[3]?.trim();
        const lsg2020VS = columns[5]?.trim(); // Column 5 has LSG 2020 VS (but it's NA in this CSV)
        const lsg2020Votes = columns[6]?.trim(); // Column 6 has LSG 2020 Votes (but it's NA in this CSV)
        const ge2024VS = columns[7]?.trim(); // Column 7 has GE 2024 VS (but it's NA in this CSV)
        const ge2024Votes = columns[8]?.trim(); // Column 8 has GE 2024 Votes (but it's NA in this CSV)
        const target2025VS = columns[9]?.trim(); // Column 9 has Target 2025 VS
        const target2025Votes = columns[10]?.trim().replace(/["\r\n]/g, ''); // Column 10 has Target 2025 Votes



        if (zone && orgDistrict && ac && orgMandal) {
          // Initialize zone if not exists
          if (!data[zone]) {
            data[zone] = {};
          }
          
          // Initialize org district if not exists
          if (!data[zone][orgDistrict]) {
            data[zone][orgDistrict] = {};
          }

          // Initialize AC if not exists
          if (!data[zone][orgDistrict][ac]) {
            data[zone][orgDistrict][ac] = [];
          }

          // Add Mandal data
          const mandalEntry = {
            name: orgMandal,
            lbName: "", // No LBName in the new CSV structure
            lsg2020: { 
              vs: lsg2020VS === "NA" ? "0%" : (lsg2020VS || "0%"), 
              votes: lsg2020Votes === "NA" ? "0" : (lsg2020Votes || "0")
            },
            ge2024: { 
              vs: ge2024VS === "NA" ? "0%" : (ge2024VS || "0%"), 
              votes: ge2024Votes === "NA" ? "0" : (ge2024Votes || "0")
            },
            target2025: { 
              vs: target2025VS === "NA" ? "0%" : (target2025VS || "0%"), 
              votes: target2025Votes === "NA" ? "0" : (target2025Votes || "0")
            }
          };
          

          
          data[zone][orgDistrict][ac].push(mandalEntry);
        }
      }
    });

    mandalVoteShareDataCache = data;
    return data;
  } catch (error) {
    console.error('Error loading Mandal vote share data:', error);
    return {};
  }
}

export function getMandalVoteShareData(ac: string, orgDistrict: string, zone: string): any[] {
  // Normalize names to handle spelling variations
  const normalizedAC = normalizeACName(ac);
  const normalizedOrg = normalizeOrgDistrictName(orgDistrict);
  const normalizedZone = normalizeZoneName(zone);
  
  if (!mandalVoteShareDataCache) {
    return [];
  }
  
  return mandalVoteShareDataCache[normalizedZone]?.[normalizedOrg]?.[normalizedAC] || [];
}
