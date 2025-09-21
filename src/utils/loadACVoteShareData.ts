import { normalizeOrgDistrictName, normalizeZoneName } from './nameNormalization';

// Utility to load AC-level vote share data from CSV
export interface ACVoteShareRowData {
  Zone: string;
  'Org District': string;
  AC: string;
  '2020 LSG VS': string;
  '2020 LSG Votes': string;
  '2024 GE VS': string;
  '2024 GE Votes': string;
  '2025 LSG VS': string;
  '2025 LSG Votes': string;
}

export interface ACVoteShareData {
  [zone: string]: {
    [orgDistrict: string]: {
      name: string;
      lsg2020: { vs: string; votes: string };
      ge2024: { vs: string; votes: string };
      target2025: { vs: string; votes: string };
    }[];
  };
}

let acVoteShareDataCache: ACVoteShareData | null = null;

export async function loadACVoteShareData(): Promise<ACVoteShareData> {
  if (acVoteShareDataCache) {
    return acVoteShareDataCache;
  }

  try {
    const response = await fetch('/data/votesharetarget/Local Body Target - AC level - Vote Share.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    // Skip header lines (first 2 lines)
    const dataLines = lines.slice(2).filter(line => line.trim() && !line.startsWith(',,,'));
    
    const data: ACVoteShareData = {};
    
    dataLines.forEach((line, index) => {
      const columns = line.split(',').map(col => col.trim().replace(/["\r\n]/g, ''));
      

      
      if (columns.length >= 9) {
        const zone = columns[0];
        const orgDistrict = columns[1];
        const ac = columns[2];
        const lsg2020VS = columns[3] || "0%";
        const lsg2020Votes = columns[4] || "0";
        const ge2024VS = columns[5] || "0%";
        const ge2024Votes = columns[6] || "0";
        const target2025VS = columns[7] || "0%";
        const target2025Votes = columns[8] || "0";



        if (zone && orgDistrict && ac) {
          // Initialize zone if not exists
          if (!data[zone]) {
            data[zone] = {};
          }
          
          // Initialize org district if not exists
          if (!data[zone][orgDistrict]) {
            data[zone][orgDistrict] = [];
          }

          // Add AC data
          data[zone][orgDistrict].push({
            name: ac,
            lsg2020: { 
              vs: (lsg2020VS === "NA" || lsg2020VS === "0") ? "0%" : (lsg2020VS || "0%"), 
              votes: (lsg2020Votes === "NA" || lsg2020Votes === "0") ? "0" : (lsg2020Votes || "0")
            },
            ge2024: { 
              vs: (ge2024VS === "NA" || ge2024VS === "0") ? "0%" : (ge2024VS || "0%"), 
              votes: (ge2024Votes === "NA" || ge2024Votes === "0") ? "0" : (ge2024Votes || "0")
            },
            target2025: { 
              vs: (target2025VS === "NA" || target2025VS === "0") ? "0%" : (target2025VS || "0%"), 
              votes: (target2025Votes === "NA" || target2025Votes === "0") ? "0" : (target2025Votes || "0")
            }
          });
          

        } else {
          console.warn(`⚠️ Skipping line ${index + 3} - missing required fields:`, { zone, orgDistrict, ac });
        }
      } else {
        console.warn(`⚠️ Skipping line ${index + 3} - insufficient columns (${columns.length}): ${line}`);
      }
    });

    acVoteShareDataCache = data;
    
    return data;
  } catch (error) {
    console.error('Error loading AC vote share data:', error);
    return {};
  }
}

export function getACVoteShareData(orgDistrict: string, zone: string): any[] {
  if (!acVoteShareDataCache) {
    return [];
  }
  
  // Normalize names to handle spelling variations
  const normalizedOrg = normalizeOrgDistrictName(orgDistrict);
  const normalizedZone = normalizeZoneName(zone);
  
  return acVoteShareDataCache[normalizedZone]?.[normalizedOrg] || [];
}
