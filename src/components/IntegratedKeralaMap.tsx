import React, { useState, useEffect, useRef } from 'react';
import { loadACData, ACData } from '../utils/loadACData';
import { loadMandalData, MandalData } from '../utils/loadMandalData';
import { loadACVoteShareData, getACVoteShareData } from '../utils/loadACVoteShareData';
import { loadMandalVoteShareData, getMandalVoteShareData } from '../utils/loadMandalVoteShareData';
import { loadLocalBodyVoteShareData, getLocalBodyVoteShareData } from '../utils/loadLocalBodyVoteShareData';
import { loadOrgDistrictTargetData, getOrgDistrictTargetData } from '../utils/loadOrgDistrictTargetData';
import { loadACTargetData, getACTargetData } from '../utils/loadACTargetData';
import { loadMandalTargetData, getMandalTargetData } from '../utils/loadMandalTargetData';
import { loadOrgDistrictContacts } from '../utils/loadOrgDistrictContacts';
import { loadMandalContactData, getMandalContactData } from '../utils/loadMandalContactData';
import { loadLocalBodyContactData, getLocalBodyContactData } from '../utils/loadLocalBodyContactData';
import { loadZoneTargetData, getZoneTargetData } from '../utils/loadZoneTargetData';
import { useMobileDetection, optimizeTouchInteractions } from '../utils/mobileDetection';
import { generateMapPDF, generateMapPDFMobile } from '../utils/mapPdfExporter';

// Type definition for map context to ensure consistency
type MapContextLevel = 'zones' | 'orgs' | 'acs' | 'mandals' | 'panchayats' | 'wards';

interface MapContext {
  level: MapContextLevel;
  zone: string;
  org: string;
  ac: string;
  mandal: string;
}
import ControlPanel from './layout/ControlPanel';
import MapControls from './layout/MapControls';
import { PerformanceModal, TargetModal, LeadershipModal } from './ui';
import { MapPin } from 'lucide-react';
import { useLoadingState } from '../utils/loadingStateManager';
import { useEnhancedDataLoader } from '../utils/enhancedDataLoader';
import { LoadingIndicator } from './ui/LoadingIndicator';
import { ErrorDisplay } from './ui/ErrorBoundary';

interface IntegratedKeralaMapProps {
  onBack?: () => void;
  onHome?: () => void;
}

const IntegratedKeralaMap: React.FC<IntegratedKeralaMapProps> = ({ onBack, onHome }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showLeadershipModal, setShowLeadershipModal] = useState(false);

  // Modal loading states
  const performanceLoading = useLoadingState('performance-modal-data');
  const targetLoading = useLoadingState('target-modal-data');
  const leadershipLoading = useLoadingState('leadership-modal-data');
  const [currentMapContext, setCurrentMapContext] = useState<MapContext>({
    level: 'zones',
    zone: '',
    org: '',
    ac: '',
    mandal: ''
  });
  const [selectedOrgDistrict, setSelectedOrgDistrict] = useState<string | null>(null);
  const [selectedAC, setSelectedAC] = useState<string | null>(null);
  const [acData, setAcData] = useState<ACData>({});
  const [mandalData, setMandalData] = useState<MandalData>({});
  const [orgDistrictContacts, setOrgDistrictContacts] = useState<any[]>([]);
  const [isControlPanelCollapsed, setIsControlPanelCollapsed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Mobile detection hook
  const mobileInfo = useMobileDetection();

  // Enhanced data loader
  const dataLoader = useEnhancedDataLoader();

  // Load AC and Mandal data from CSV
  useEffect(() => {
    loadACData().then(setAcData);
    loadMandalData().then(setMandalData);
    // Load vote share data for performance modal
    loadACVoteShareData();
    loadMandalVoteShareData();
    loadLocalBodyVoteShareData();
    // Load target data for target modal
    loadZoneTargetData();
    loadOrgDistrictTargetData();
    loadACTargetData();
    loadMandalTargetData();
    // Load contact data for contact modal
    loadOrgDistrictContacts().then(setOrgDistrictContacts);
    loadMandalContactData();
    loadLocalBodyContactData();
  }, []);

  // Initialize mobile optimizations
  useEffect(() => {
    if (mobileInfo.isMobile || mobileInfo.isTouchDevice) {
      optimizeTouchInteractions();
    }
  }, [mobileInfo]);

  // Performance data for different zones
  const zonePerformanceData = {
    "Thiruvananthapuram": [
      { name: "Thiruvananthapuram South", lsg2020: { vs: "20.79%", votes: "162,607" }, ge2024: { vs: "30.05%", votes: "210,956" }, target2025: { vs: "34.48%", votes: "326,544" } },
      { name: "Thiruvananthapuram City", lsg2020: { vs: "30.60%", votes: "147,925" }, ge2024: { vs: "39.90%", votes: "214,761" }, target2025: { vs: "40.90%", votes: "315,395" } },
      { name: "Thiruvananthapuram North", lsg2020: { vs: "19.93%", votes: "153,151" }, ge2024: { vs: "31.95%", votes: "210,471" }, target2025: { vs: "35.78%", votes: "350,356" } },
      { name: "Kollam East", lsg2020: { vs: "18.61%", votes: "147,652" }, ge2024: { vs: "16.07%", votes: "108,227" }, target2025: { vs: "27.08%", votes: "263,849" } },
      { name: "Kollam West", lsg2020: { vs: "19.47%", votes: "173,864" }, ge2024: { vs: "21.46%", votes: "160,628" }, target2025: { vs: "29.91%", votes: "313,357" } },
      { name: "Pathanamthitta", lsg2020: { vs: "17.51%", votes: "135,289" }, ge2024: { vs: "26.01%", votes: "173,722" }, target2025: { vs: "31.88%", votes: "320,214" } }
    ],
    "Alappuzha": [
      { name: "Alappuzha South", lsg2020: { vs: "21.98%", votes: "136,610" }, ge2024: { vs: "26.87%", votes: "145,702" }, target2025: { vs: "36.17%", votes: "272,437" } },
      { name: "Alappuzha North", lsg2020: { vs: "16.29%", votes: "124,546" }, ge2024: { vs: "22.08%", votes: "162,420" }, target2025: { vs: "26.03%", votes: "239,812" } },
      { name: "Kottayam East", lsg2020: { vs: "13.24%", votes: "74,741" }, ge2024: { vs: "20.83%", votes: "96,280" }, target2025: { vs: "28.15%", votes: "190,728" } },
      { name: "Kottayam West", lsg2020: { vs: "11.90%", votes: "86,106" }, ge2024: { vs: "20.35%", votes: "107,817" }, target2025: { vs: "25.17%", votes: "216,815" } },
      { name: "Idukki South", lsg2020: { vs: "6.44%", votes: "25,441" }, ge2024: { vs: "11.36%", votes: "40,171" }, target2025: { vs: "16.35%", votes: "84,608" } },
      { name: "Idukki North", lsg2020: { vs: "7.36%", votes: "18,144" }, ge2024: { vs: "9.71%", votes: "9,220" }, target2025: { vs: "20.16%", votes: "66,716" } }
    ],
    "Ernakulam": [
      { name: "Ernakulam East", lsg2020: { vs: "5.53%", votes: "34,951" }, ge2024: { vs: "10.60%", votes: "52,944" }, target2025: { vs: "12.17%", votes: "81,669" } },
      { name: "Ernakulam City", lsg2020: { vs: "10.94%", votes: "72,699" }, ge2024: { vs: "13.78%", votes: "101,543" }, target2025: { vs: "20.87%", votes: "167,969" } },
      { name: "Ernakulam North", lsg2020: { vs: "10.16%", votes: "81,964" }, ge2024: { vs: "12.29%", votes: "85,125" }, target2025: { vs: "16.45%", votes: "150,360" } },
      { name: "Thrissur South", lsg2020: { vs: "17.99%", votes: "112,776" }, ge2024: { vs: "20.44%", votes: "109,847" }, target2025: { vs: "28.21%", votes: "208,552" } },
      { name: "Thrissur City", lsg2020: { vs: "21.92%", votes: "161,667" }, ge2024: { vs: "39.32%", votes: "286,870" }, target2025: { vs: "40.47%", votes: "391,903" } },
      { name: "Thrissur North", lsg2020: { vs: "17.30%", votes: "113,938" }, ge2024: { vs: "22.04%", votes: "137,984" }, target2025: { vs: "27.25%", votes: "230,808" } }
    ],
    "Palakkad": [
      { name: "Palakkad East", lsg2020: { vs: "16.51%", votes: "163,576" }, ge2024: { vs: "22.23%", votes: "210,277" }, target2025: { vs: "26.84%", votes: "310,467" } },
      { name: "Palakkad West", lsg2020: { vs: "14.36%", votes: "133,798" }, ge2024: { vs: "20.10%", votes: "170,384" }, target2025: { vs: "23.13%", votes: "256,846" } },
      { name: "Malappuram West", lsg2020: { vs: "7.49%", votes: "74,736" }, ge2024: { vs: "11.68%", votes: "111,236" }, target2025: { vs: "15.26%", votes: "189,004" } },
      { name: "Malappuram Central", lsg2020: { vs: "3.53%", votes: "29,168" }, ge2024: { vs: "7.17%", votes: "53,790" }, target2025: { vs: "8.33%", votes: "84,349" } },
      { name: "Malappuram East", lsg2020: { vs: "3.09%", votes: "27,164" }, ge2024: { vs: "8.02%", votes: "63,900" }, target2025: { vs: "9.02%", votes: "93,699" } },
      { name: "Wayanad", lsg2020: { vs: "11.17%", votes: "57,249" }, ge2024: { vs: "18.13%", votes: "80,596" }, target2025: { vs: "21.15%", votes: "128,618" } }
    ],
    "Kozhikode": [
      { name: "Kozhikode City", lsg2020: { vs: "14.72%", votes: "42,552" }, ge2024: { vs: "16.29%", votes: "45,214" }, target2025: { vs: "19.32%", votes: "64,826" } },
      { name: "Kozhikode Rural", lsg2020: { vs: "8.59%", votes: "124,871" }, ge2024: { vs: "12.38%", votes: "148,580" }, target2025: { vs: "14.72%", votes: "207,136" } },
      { name: "Kozhikode North", lsg2020: { vs: "8.81%", votes: "75,535" }, ge2024: { vs: "8.33%", votes: "70,484" }, target2025: { vs: "10.81%", votes: "106,744" } },
      { name: "Kannur South", lsg2020: { vs: "11.27%", votes: "88,735" }, ge2024: { vs: "11.18%", votes: "79,656" }, target2025: { vs: "14.83%", votes: "131,628" } },
      { name: "Kannur North", lsg2020: { vs: "5.70%", votes: "58,143" }, ge2024: { vs: "10.97%", votes: "109,340" }, target2025: { vs: "11.99%", votes: "137,412" } },
      { name: "Kasaragod", lsg2020: { vs: "17.24%", votes: "136,808" }, ge2024: { vs: "23.38%", votes: "181,524" }, target2025: { vs: "26.44%", votes: "257,860" } }
    ]
  };

  // Target data for different zones
  const zoneTargetData = {
    "Thiruvananthapuram": {
      panchayat: { total: 194, targetWin: 108, targetOpposition: 18 },
      municipality: { total: 12, targetWin: 7, targetOpposition: 2 },
      corporation: { total: 2, targetWin: 1, targetOpposition: 1 }
    },
    "Alappuzha": {
      panchayat: { total: 195, targetWin: 69, targetOpposition: 22 },
      municipality: { total: 15, targetWin: 7, targetOpposition: 2 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Ernakulam": {
      panchayat: { total: 168, targetWin: 46, targetOpposition: 3 },
      municipality: { total: 21, targetWin: 7, targetOpposition: 3 },
      corporation: { total: 2, targetWin: 1, targetOpposition: 0 }
    },
    "Palakkad": {
      panchayat: { total: 205, targetWin: 26, targetOpposition: 20 },
      municipality: { total: 22, targetWin: 4, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Kozhikode": {
      panchayat: { total: 179, targetWin: 19, targetOpposition: 4 },
      municipality: { total: 19, targetWin: 1, targetOpposition: 2 },
      corporation: { total: 2, targetWin: 0, targetOpposition: 0 }
    }
  };

  // Org district target data for Thiruvananthapuram zone
  const tvmOrgDistrictData = {
    "Thiruvananthapuram South": {
      panchayat: { total: 35, targetWin: 23, targetOpposition: 4 },
      municipality: { total: 1, targetWin: 1, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Thiruvananthapuram City": {
      panchayat: { total: 0, targetWin: 0, targetOpposition: 0 },
      municipality: { total: 0, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 1, targetWin: 1, targetOpposition: 0 }
    },
    "Thiruvananthapuram North": {
      panchayat: { total: 38, targetWin: 25, targetOpposition: 0 },
      municipality: { total: 3, targetWin: 3, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Kollam East": {
      panchayat: { total: 41, targetWin: 16, targetOpposition: 7 },
      municipality: { total: 2, targetWin: 1, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Kollam West": {
      panchayat: { total: 27, targetWin: 15, targetOpposition: 3 },
      municipality: { total: 2, targetWin: 1, targetOpposition: 1 },
      corporation: { total: 1, targetWin: 0, targetOpposition: 1 }
    },
    "Pathanamthitta": {
      panchayat: { total: 53, targetWin: 29, targetOpposition: 3 },
      municipality: { total: 4, targetWin: 2, targetOpposition: 1 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    }
  };

  // Org district target data for Alappuzha zone
  const alappuzhaOrgDistrictData = {
    "Alappuzha South": {
      panchayat: { total: 33, targetWin: 23, targetOpposition: 0 },
      municipality: { total: 4, targetWin: 3, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Alappuzha North": {
      panchayat: { total: 39, targetWin: 11, targetOpposition: 7 },
      municipality: { total: 3, targetWin: 0, targetOpposition: 1 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Kottayam East": {
      panchayat: { total: 31, targetWin: 15, targetOpposition: 1 },
      municipality: { total: 2, targetWin: 1, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Kottayam West": {
      panchayat: { total: 40, targetWin: 9, targetOpposition: 6 },
      municipality: { total: 4, targetWin: 2, targetOpposition: 1 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Idukki South": {
      panchayat: { total: 28, targetWin: 3, targetOpposition: 4 },
      municipality: { total: 1, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Idukki North": {
      panchayat: { total: 24, targetWin: 8, targetOpposition: 4 },
      municipality: { total: 1, targetWin: 1, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    }
  };

  // Org district target data for Ernakulam zone
  const ernakulamOrgDistrictData = {
    "Ernakulam City": {
      panchayat: { total: 13, targetWin: 4, targetOpposition: 1 },
      municipality: { total: 3, targetWin: 1, targetOpposition: 0 },
      corporation: { total: 1, targetWin: 0, targetOpposition: 0 }
    },
    "Ernakulam East": {
      panchayat: { total: 36, targetWin: 0, targetOpposition: 1 },
      municipality: { total: 4, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Ernakulam North": {
      panchayat: { total: 33, targetWin: 3, targetOpposition: 1 },
      municipality: { total: 6, targetWin: 1, targetOpposition: 3 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Thrissur City": {
      panchayat: { total: 30, targetWin: 19, targetOpposition: 0 },
      municipality: { total: 0, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 1, targetWin: 1, targetOpposition: 0 }
    },
    "Thrissur North": {
      panchayat: { total: 29, targetWin: 7, targetOpposition: 0 },
      municipality: { total: 4, targetWin: 2, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Thrissur South": {
      panchayat: { total: 27, targetWin: 12, targetOpposition: 0 },
      municipality: { total: 3, targetWin: 2, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    }
  };

  // Org district target data for Palakkad zone
  const palakkadOrgDistrictData = {
    "Malappuram Central": {
      panchayat: { total: 29, targetWin: 0, targetOpposition: 1 },
      municipality: { total: 4, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Malappuram East": {
      panchayat: { total: 32, targetWin: 0, targetOpposition: 0 },
      municipality: { total: 3, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Malappuram West": {
      panchayat: { total: 33, targetWin: 4, targetOpposition: 0 },
      municipality: { total: 5, targetWin: 1, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Palakkad East": {
      panchayat: { total: 45, targetWin: 13, targetOpposition: 6 },
      municipality: { total: 2, targetWin: 1, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Palakkad West": {
      panchayat: { total: 43, targetWin: 6, targetOpposition: 9 },
      municipality: { total: 5, targetWin: 2, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Wayanad": {
      panchayat: { total: 23, targetWin: 3, targetOpposition: 4 },
      municipality: { total: 3, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    }
  };

  // Org district target data for Kozhikode zone
  const kozhikodeOrgDistrictData = {
    "Kozhikode City": {
      panchayat: { total: 7, targetWin: 1, targetOpposition: 0 },
      municipality: { total: 2, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 1, targetWin: 0, targetOpposition: 0 }
    },
    "Kozhikode North": {
      panchayat: { total: 36, targetWin: 1, targetOpposition: 0 },
      municipality: { total: 3, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Kozhikode Rural": {
      panchayat: { total: 27, targetWin: 2, targetOpposition: 0 },
      municipality: { total: 2, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Kannur North": {
      panchayat: { total: 37, targetWin: 0, targetOpposition: 0 },
      municipality: { total: 4, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 1, targetWin: 0, targetOpposition: 0 }
    },
    "Kannur South": {
      panchayat: { total: 34, targetWin: 1, targetOpposition: 3 },
      municipality: { total: 4, targetWin: 1, targetOpposition: 1 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    },
    "Kasaragod": {
      panchayat: { total: 38, targetWin: 14, targetOpposition: 1 },
      municipality: { total: 3, targetWin: 0, targetOpposition: 1 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    }
  };

  // AC-level target data for Alappuzha zone
  // AC data is now loaded from CSV via acData state

  // Function to get performance data based on current context
  const getPerformanceData = () => {
    if (currentMapContext.level === 'zones') {
      // Show zone-level data (summary data for each zone)
      return [
        { name: "Thiruvananthapuram", lsg2020: { vs: "19.13%", votes: "920,488" }, ge2024: { vs: "25.23%", votes: "1,078,764" }, target2025: { vs: "31.99%", votes: "1,889,715" } },
        { name: "Alappuzha", lsg2020: { vs: "13.46%", votes: "465,588" }, ge2024: { vs: "20.20%", votes: "561,611" }, target2025: { vs: "25.94%", votes: "1,071,117" } },
        { name: "Ernakulam", lsg2020: { vs: "13.65%", votes: "577,995" }, ge2024: { vs: "19.46%", votes: "774,313" }, target2025: { vs: "23.60%", votes: "1,231,261" } },
        { name: "Palakkad", lsg2020: { vs: "9.98%", votes: "485,691" }, ge2024: { vs: "15.16%", votes: "690,183" }, target2025: { vs: "18.03%", votes: "1,062,983" } },
        { name: "Kozhikode", lsg2020: { vs: "10.60%", votes: "526,644" }, ge2024: { vs: "13.50%", votes: "634,799" }, target2025: { vs: "16.02%", votes: "905,606" } }
      ];
    } else if (currentMapContext.level === 'orgs' && currentMapContext.zone) {
      // Show org district data for the current zone at the zone level, OR AC data for a specific org
      if (currentMapContext.org) {
        // We're drilling down into a specific org district - show AC-level data
        return getACVoteShareData(currentMapContext.org, currentMapContext.zone);
      } else {
        // We're at zone level showing org districts
        return zonePerformanceData[currentMapContext.zone as keyof typeof zonePerformanceData] || [];
      }
    } else if (currentMapContext.level === 'acs' && currentMapContext.org && currentMapContext.zone) {
      // Show AC-level vote share data for the current org district
      return getACVoteShareData(currentMapContext.org, currentMapContext.zone);
    } else if (currentMapContext.level === 'mandals' && currentMapContext.ac && currentMapContext.org && currentMapContext.zone) {
      // Show Mandal-level vote share data for the current AC
      return getMandalVoteShareData(currentMapContext.ac, currentMapContext.org, currentMapContext.zone);
    } else if ((currentMapContext.level === 'panchayats' || currentMapContext.level === 'wards') && currentMapContext.mandal && currentMapContext.ac && currentMapContext.org && currentMapContext.zone) {
      // Show Local Body vote share data for the current Mandal
      return getLocalBodyVoteShareData(currentMapContext.mandal, currentMapContext.ac, currentMapContext.org, currentMapContext.zone);
    }

    return [];
  };

  const getGrandTotal = () => {
    const data = getPerformanceData();
    if (data.length === 0) return null;

    const totals = data.reduce((acc: any, item: any) => ({
      lsg2020: { vs: acc.lsg2020.vs + parseFloat(item.lsg2020.vs), votes: acc.lsg2020.votes + parseInt(item.lsg2020.votes.replace(/,/g, '')) },
      ge2024: { vs: acc.ge2024.vs + parseFloat(item.ge2024.vs), votes: acc.ge2024.votes + parseInt(item.ge2024.votes.replace(/,/g, '')) },
      target2025: { vs: acc.target2025.vs + parseFloat(item.target2025.vs), votes: acc.target2025.votes + parseInt(item.target2025.votes.replace(/,/g, '')) }
    }), { lsg2020: { vs: 0, votes: 0 }, ge2024: { vs: 0, votes: 0 }, target2025: { vs: 0, votes: 0 } });

    return {
      lsg2020: { vs: (totals.lsg2020.vs / data.length).toFixed(2) + "%", votes: totals.lsg2020.votes.toLocaleString() },
      ge2024: { vs: (totals.ge2024.vs / data.length).toFixed(2) + "%", votes: totals.ge2024.votes.toLocaleString() },
      target2025: { vs: (totals.target2025.vs / data.length).toFixed(2) + "%", votes: totals.target2025.votes.toLocaleString() }
    };
  };

  // Helper functions for accurate calculations
  const calculateGrandTotals = () => {
    const totals = {
      panchayat: { total: 0, targetWin: 0, targetOpposition: 0 },
      municipality: { total: 0, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    };

    Object.values(zoneTargetData).forEach(zoneData => {
      totals.panchayat.total += zoneData.panchayat.total;
      totals.panchayat.targetWin += zoneData.panchayat.targetWin;
      totals.panchayat.targetOpposition += zoneData.panchayat.targetOpposition;

      totals.municipality.total += zoneData.municipality.total;
      totals.municipality.targetWin += zoneData.municipality.targetWin;
      totals.municipality.targetOpposition += zoneData.municipality.targetOpposition;

      totals.corporation.total += zoneData.corporation.total;
      totals.corporation.targetWin += zoneData.corporation.targetWin;
      totals.corporation.targetOpposition += zoneData.corporation.targetOpposition;
    });

    return totals;
  };

  const calculateOverallTotals = () => {
    const grandTotals = calculateGrandTotals();
    return {
      totalTargetWins: grandTotals.panchayat.targetWin + grandTotals.municipality.targetWin + grandTotals.corporation.targetWin,
      totalOpposition: grandTotals.panchayat.targetOpposition + grandTotals.municipality.targetOpposition + grandTotals.corporation.targetOpposition,
      totalPanchayats: grandTotals.panchayat.total
    };
  };

  // Helper functions for TVM org district calculations
  const calculateTvmOrgDistrictTotals = () => {
    const totals = {
      panchayat: { total: 0, targetWin: 0, targetOpposition: 0 },
      municipality: { total: 0, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    };

    Object.values(tvmOrgDistrictData).forEach(orgData => {
      totals.panchayat.total += orgData.panchayat.total;
      totals.panchayat.targetWin += orgData.panchayat.targetWin;
      totals.panchayat.targetOpposition += orgData.panchayat.targetOpposition;

      totals.municipality.total += orgData.municipality.total;
      totals.municipality.targetWin += orgData.municipality.targetWin;
      totals.municipality.targetOpposition += orgData.municipality.targetOpposition;

      totals.corporation.total += orgData.corporation.total;
      totals.corporation.targetWin += orgData.corporation.targetWin;
      totals.corporation.targetOpposition += orgData.corporation.targetOpposition;
    });

    return totals;
  };

  const calculateTvmOverallTotals = () => {
    const orgTotals = calculateTvmOrgDistrictTotals();
    return {
      totalTargetWins: orgTotals.panchayat.targetWin + orgTotals.municipality.targetWin + orgTotals.corporation.targetWin,
      totalOpposition: orgTotals.panchayat.targetOpposition + orgTotals.municipality.targetOpposition + orgTotals.corporation.targetOpposition,
      totalPanchayats: orgTotals.panchayat.total
    };
  };

  // Helper functions for Alappuzha org district calculations
  const calculateAlappuzhaOrgDistrictTotals = () => {
    const totals = {
      panchayat: { total: 0, targetWin: 0, targetOpposition: 0 },
      municipality: { total: 0, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    };

    Object.values(alappuzhaOrgDistrictData).forEach(orgData => {
      totals.panchayat.total += orgData.panchayat.total;
      totals.panchayat.targetWin += orgData.panchayat.targetWin;
      totals.panchayat.targetOpposition += orgData.panchayat.targetOpposition;

      totals.municipality.total += orgData.municipality.total;
      totals.municipality.targetWin += orgData.municipality.targetWin;
      totals.municipality.targetOpposition += orgData.municipality.targetOpposition;

      totals.corporation.total += orgData.corporation.total;
      totals.corporation.targetWin += orgData.corporation.targetWin;
      totals.corporation.targetOpposition += orgData.corporation.targetOpposition;
    });

    return totals;
  };

  const calculateAlappuzhaOverallTotals = () => {
    const orgTotals = calculateAlappuzhaOrgDistrictTotals();
    return {
      totalTargetWins: orgTotals.panchayat.targetWin + orgTotals.municipality.targetWin + orgTotals.corporation.targetWin,
      totalOpposition: orgTotals.panchayat.targetOpposition + orgTotals.municipality.targetOpposition + orgTotals.corporation.targetOpposition,
      totalPanchayats: orgTotals.panchayat.total
    };
  };

  // Helper functions for Ernakulam org district calculations
  const calculateErnakulamOrgDistrictTotals = () => {
    const totals = {
      panchayat: { total: 0, targetWin: 0, targetOpposition: 0 },
      municipality: { total: 0, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    };

    Object.values(ernakulamOrgDistrictData).forEach(orgData => {
      totals.panchayat.total += orgData.panchayat.total;
      totals.panchayat.targetWin += orgData.panchayat.targetWin;
      totals.panchayat.targetOpposition += orgData.panchayat.targetOpposition;

      totals.municipality.total += orgData.municipality.total;
      totals.municipality.targetWin += orgData.municipality.targetWin;
      totals.municipality.targetOpposition += orgData.municipality.targetOpposition;

      totals.corporation.total += orgData.corporation.total;
      totals.corporation.targetWin += orgData.corporation.targetWin;
      totals.corporation.targetOpposition += orgData.corporation.targetOpposition;
    });

    return totals;
  };

  const calculateErnakulamOverallTotals = () => {
    const orgTotals = calculateErnakulamOrgDistrictTotals();
    return {
      totalTargetWins: orgTotals.panchayat.targetWin + orgTotals.municipality.targetWin + orgTotals.corporation.targetWin,
      totalOpposition: orgTotals.panchayat.targetOpposition + orgTotals.municipality.targetOpposition + orgTotals.corporation.targetOpposition,
      totalPanchayats: orgTotals.panchayat.total
    };
  };

  // Helper functions for Palakkad org district calculations
  const calculatePalakkadOrgDistrictTotals = () => {
    const totals = {
      panchayat: { total: 0, targetWin: 0, targetOpposition: 0 },
      municipality: { total: 0, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    };

    Object.values(palakkadOrgDistrictData).forEach(orgData => {
      totals.panchayat.total += orgData.panchayat.total;
      totals.panchayat.targetWin += orgData.panchayat.targetWin;
      totals.panchayat.targetOpposition += orgData.panchayat.targetOpposition;

      totals.municipality.total += orgData.municipality.total;
      totals.municipality.targetWin += orgData.municipality.targetWin;
      totals.municipality.targetOpposition += orgData.municipality.targetOpposition;

      totals.corporation.total += orgData.corporation.total;
      totals.corporation.targetWin += orgData.corporation.targetWin;
      totals.corporation.targetOpposition += orgData.corporation.targetOpposition;
    });

    return totals;
  };

  const calculatePalakkadOverallTotals = () => {
    const orgTotals = calculatePalakkadOrgDistrictTotals();
    return {
      totalTargetWins: orgTotals.panchayat.targetWin + orgTotals.municipality.targetWin + orgTotals.corporation.targetWin,
      totalOpposition: orgTotals.panchayat.targetOpposition + orgTotals.municipality.targetOpposition + orgTotals.corporation.targetOpposition,
      totalPanchayats: orgTotals.panchayat.total
    };
  };

  // Helper functions for Kozhikode org district calculations
  const calculateKozhikodeOrgDistrictTotals = () => {
    const totals = {
      panchayat: { total: 0, targetWin: 0, targetOpposition: 0 },
      municipality: { total: 0, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    };

    Object.values(kozhikodeOrgDistrictData).forEach(orgData => {
      totals.panchayat.total += orgData.panchayat.total;
      totals.panchayat.targetWin += orgData.panchayat.targetWin;
      totals.panchayat.targetOpposition += orgData.panchayat.targetOpposition;

      totals.municipality.total += orgData.municipality.total;
      totals.municipality.targetWin += orgData.municipality.targetWin;
      totals.municipality.targetOpposition += orgData.municipality.targetOpposition;

      totals.corporation.total += orgData.corporation.total;
      totals.corporation.targetWin += orgData.corporation.targetWin;
      totals.corporation.targetOpposition += orgData.corporation.targetOpposition;
    });

    return totals;
  };

  const calculateKozhikodeOverallTotals = () => {
    const orgTotals = calculateKozhikodeOrgDistrictTotals();
    return {
      totalTargetWins: orgTotals.panchayat.targetWin + orgTotals.municipality.targetWin + orgTotals.corporation.targetWin,
      totalOpposition: orgTotals.panchayat.targetOpposition + orgTotals.municipality.targetOpposition + orgTotals.corporation.targetOpposition,
      totalPanchayats: orgTotals.panchayat.total
    };
  };

  // Helper functions for Alappuzha AC-level calculations
  const calculateACTotals = (orgDistrictName: string) => {
    const totals = {
      panchayat: { total: 0, targetWin: 0, targetOpposition: 0 },
      municipality: { total: 0, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    };

    const orgDistrictData = acData[orgDistrictName];
    if (orgDistrictData) {
      Object.values(orgDistrictData).forEach(acData => {
        totals.panchayat.total += acData.panchayat.total;
        totals.panchayat.targetWin += acData.panchayat.targetWin;
        totals.panchayat.targetOpposition += acData.panchayat.targetOpposition;

        totals.municipality.total += acData.municipality.total;
        totals.municipality.targetWin += acData.municipality.targetWin;
        totals.municipality.targetOpposition += acData.municipality.targetOpposition;

        totals.corporation.total += acData.corporation.total;
        totals.corporation.targetWin += acData.corporation.targetWin;
        totals.corporation.targetOpposition += acData.corporation.targetOpposition;
      });
    }

    return totals;
  };

  // Function to calculate totals for any AC mandal data
  const calculateMandalTotals = (orgDistrict: string, acName: string) => {
    const totals = {
      panchayat: { total: 0, targetWin: 0, targetOpposition: 0 },
      municipality: { total: 0, targetWin: 0, targetOpposition: 0 },
      corporation: { total: 0, targetWin: 0, targetOpposition: 0 }
    };

    if (mandalData[orgDistrict] && mandalData[orgDistrict][acName]) {
      Object.values(mandalData[orgDistrict][acName]).forEach(mandalData => {
        totals.panchayat.total += mandalData.panchayat.total;
        totals.panchayat.targetWin += mandalData.panchayat.targetWin;
        totals.panchayat.targetOpposition += mandalData.panchayat.targetOpposition;

        totals.municipality.total += mandalData.municipality.total;
        totals.municipality.targetWin += mandalData.municipality.targetWin;
        totals.municipality.targetOpposition += mandalData.municipality.targetOpposition;

        totals.corporation.total += mandalData.corporation.total;
        totals.corporation.targetWin += mandalData.corporation.targetWin;
        totals.corporation.targetOpposition += mandalData.corporation.targetOpposition;
      });
    }

    return totals;
  };

  // Function to get target data based on current context
  const getTargetData = () => {
    if (currentMapContext.level === 'zones') {
      // Show zone-level data from CSV
      return getZoneTargetData();
    } else if (currentMapContext.level === 'orgs' && currentMapContext.zone) {
      // Show org district level data for the current zone
      return getOrgDistrictTargetData(currentMapContext.zone);
    } else if (currentMapContext.level === 'acs' && currentMapContext.zone && currentMapContext.org) {
      // Show AC level data for the current zone and org district
      return getACTargetData(currentMapContext.zone, currentMapContext.org);
    } else if (currentMapContext.level === 'mandals' && currentMapContext.zone && currentMapContext.org && currentMapContext.ac) {
      // Show mandal level data for the current zone, org district, and AC
      return getMandalTargetData(currentMapContext.zone, currentMapContext.org, currentMapContext.ac);
    }

    // Fallback to zone level data
    return getZoneTargetData();
  };

  // Transform target data for the new modal component
  const getTransformedTargetData = () => {
    const rawData = getTargetData();
    if (!Array.isArray(rawData)) return {};

    const transformedData: Record<string, any> = {};

    rawData.forEach((item: any) => {
      transformedData[item.name] = {
        panchayat: {
          total: item.lsgTotal || 0,
          targetWin: item.lsgTargetWin || 0,
          targetOpposition: item.lsgTargetOpposition || 0
        },
        municipality: {
          total: item.municipalityTotal || 0,
          targetWin: item.municipalityTargetWin || 0,
          targetOpposition: item.municipalityTargetOpposition || 0
        },
        corporation: {
          total: item.corporationTotal || 0,
          targetWin: item.corporationTargetWin || 0,
          targetOpposition: item.corporationTargetOpposition || 0
        }
      };
    });

    return transformedData;
  };

  // Transform contact data for the new modal component
  const getTransformedContactData = () => {
    const rawData = getContactData();
    console.log('🔄 Transforming contact data. Raw data:', rawData);
    
    if (!Array.isArray(rawData)) {
      console.warn('⚠️ Raw data is not an array:', typeof rawData, rawData);
      return [];
    }

    // For zone level, return the data in the format expected by the table
    if (currentMapContext.level === 'zones') {
      return rawData.map((contact: any) => ({
        name: contact.name,
        inchargeName: contact.inchargeName,
        inchargePhone: contact.inchargePhone,
        presidentName: contact.presidentName,
        presidentPhone: contact.presidentPhone,
        position: 'Zone',
        phone: contact.inchargePhone,
        email: contact.email,
        address: contact.address,
        area: contact.area
      }));
    }

    // For mandal level and local body level, transform based on their structure
    const transformed = rawData.map((contact: any) => ({
      name: contact.name,
      inchargeName: contact.inchargeName,
      inchargePhone: contact.inchargePhone,
      presidentName: contact.presidentName,
      presidentPhone: contact.presidentPhone,
      secretaryName: contact.secretaryName,
      secretaryPhone: contact.secretaryPhone,
      type: contact.type,
      position: contact.type || 'Contact',
      phone: contact.presidentPhone || contact.inchargePhone,
      email: contact.email,
      address: contact.address,
      area: contact.area
    }));
    
    console.log('✅ Transformed contact data:', transformed);
    return transformed;
  };

  // Function to get contact data based on current context
  const getContactData = () => {
    const level = currentMapContext.level;
    const zoneName = currentMapContext.zone;
    const orgName = currentMapContext.org;
    const acName = currentMapContext.ac;
    const mandalName = currentMapContext.mandal;

    console.log('🔍 Getting contact data for context:', { level, zoneName, orgName, acName, mandalName });

    if (level === 'zones') {
      // Zone leadership data - using only Incharge from org_districts_contacts.csv
      const zoneData = [
        { name: "Thiruvananthapuram", inchargeName: "Shri.B.B Gopakumar", inchargePhone: "9447472265", presidentName: "Zone Incharge", presidentPhone: "9447472265" },
        { name: "Alappuzha", inchargeName: "Shri.N.Hari", inchargePhone: "9446924053", presidentName: "Zone Incharge", presidentPhone: "9446924053" },
        { name: "Ernakulam", inchargeName: "Shri.V.Unnikrishnan Master", inchargePhone: "9447630600", presidentName: "Zone Incharge", presidentPhone: "9447630600" },
        { name: "Palakkad", inchargeName: "Shri.K.Narayanan Master", inchargePhone: "9447004994", presidentName: "Zone Incharge", presidentPhone: "9447004994" },
        { name: "Kozhikode", inchargeName: "Shri.O.Nidheesh", inchargePhone: "8075480152", presidentName: "Zone Incharge", presidentPhone: "8075480152" },
      ];
      console.log('📞 Returning zone contact data (ALWAYS AVAILABLE):', zoneData);
      return zoneData;
    } else if (level === 'orgs' && zoneName) {
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
      console.log('📊 Available org district contacts:', orgDistrictContacts.length);
      const zoneContacts = orgDistrictContacts.filter(contact =>
        zoneMapping[contact.orgDistrict] === zoneName
      );
      console.log('🎯 Filtered contacts for zone', zoneName, ':', zoneContacts);

      // Transform to the expected format
      const transformedContacts = zoneContacts.map(contact => ({
        name: contact.orgDistrict,
        inchargeName: contact.inchargeName,
        inchargePhone: contact.inchargePhone,
        presidentName: contact.presidentName,
        presidentPhone: contact.presidentPhone
      }));
      console.log('📞 Returning org district contacts:', transformedContacts);
      return transformedContacts;
    } else if (level === 'acs' && orgName) {
      // AC level contacts are empty as per user request
      console.log('ℹ️ AC level - no contacts available');
      return [];
    } else if (level === 'mandals' && acName) {
      const mandalContacts = getMandalContactData(zoneName, orgName);
      console.log('📞 Returning mandal contacts:', mandalContacts);
      return mandalContacts.map((mandal: any) => ({
        name: mandal.name,
        presidentName: mandal.president?.name || 'NA',
        presidentPhone: mandal.president?.phone || 'NA',
        inchargeName: mandal.prabhari?.name || 'NA',
        inchargePhone: mandal.prabhari?.phone || 'NA'
      }));
    } else if (level === 'panchayats' && mandalName) {
      const localBodyContacts = getLocalBodyContactData(zoneName, orgName, acName, mandalName);
      console.log('📞 Returning local body contacts:', localBodyContacts);
      return localBodyContacts.map((localBody: any) => ({
        name: localBody.name,
        presidentName: localBody.president?.name || 'NA',
        presidentPhone: localBody.president?.phone || 'NA',
        inchargeName: localBody.incharge?.name || 'NA',
        inchargePhone: localBody.incharge?.phone || 'NA',
        secretaryName: localBody.secretary?.name || 'NA',
        secretaryPhone: localBody.secretary?.phone || 'NA',
        type: localBody.type || 'Panchayat'
      }));
    }
    console.log('❌ No contacts found for context:', { level, zoneName, orgName, acName, mandalName });
    return [];
  };

  // Auto-sync Target modal state with current map context
  useEffect(() => {
    if (showTargetModal) {
      if (currentMapContext.level === 'orgs' && currentMapContext.org) {
        // At Org District level - show AC targets for this org district
        setSelectedOrgDistrict(currentMapContext.org);
        setSelectedAC(null); // Clear AC to show AC list
      } else if (currentMapContext.level === 'acs' && currentMapContext.org && currentMapContext.ac) {
        // At AC level - show mandal targets for this AC
        setSelectedOrgDistrict(currentMapContext.org);
        setSelectedAC(currentMapContext.ac);
      } else if (currentMapContext.level === 'mandals' && currentMapContext.org && currentMapContext.ac) {
        // At Mandal level - show mandal targets for this AC
        setSelectedOrgDistrict(currentMapContext.org);
        setSelectedAC(currentMapContext.ac);
      } else {
        // At Zone level or other levels - clear selections
        setSelectedOrgDistrict(null);
        setSelectedAC(null);
      }
    }
  }, [showTargetModal, currentMapContext]);

  useEffect(() => {
    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Handle messages from iframe for navigation
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data && event.data.type === 'map-navigation') {
        switch (event.data.action) {
          case 'back':
            // Don't call onBack - let the iframe handle its own back navigation
            // The iframe will handle the back navigation internally
            break;
          case 'home':
            if (onHome) onHome();
            break;
          case 'drill-down':
            // Handle drill down navigation if needed
            break;
          case 'context-change':
            // Update map context when drill-down level changes
            const newContext = event.data.context;
            if (newContext &&
              ['zones', 'orgs', 'acs', 'mandals', 'panchayats', 'wards'].includes(newContext.level)) {
              setCurrentMapContext(newContext as MapContext);
            }
            break;
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('message', handleMessage);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('message', handleMessage);
    };
  }, [onBack, onHome]);

  const toggleFullscreen = async () => {
    const container = document.getElementById('integrated-map-container');
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const refreshMap = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      setMapError(false);
      // Refresh the map
      iframeRef.current.src = `/map/pan.html`;
    }
  };

  const handleIframeLoad = () => {
    // Give the map a moment to fully initialize
    setTimeout(() => {
      setIsLoading(false);
      setMapError(false);
      
      // Inject CSS to ORGANIZE and CLEAN UP the iframe elements (not hide them)
      try {
        const iframe = iframeRef.current;
        if (iframe?.contentDocument) {
          const style = iframe.contentDocument.createElement('style');
          style.textContent = `
            /* MINIMAL CLEANUP - Only hide specific breadcrumb elements */
            
            /* Hide breadcrumb navigation and target areas section */
            .breadcrumb-nav, 
            .navigation-container:has(.breadcrumb),
            .nav-breadcrumb {
              display: none !important;
            }
            
            /* SPECIFIC TARGET AREAS HIDING - Don't hide map elements */
            .target-areas:not(.leaflet-container):not(#map),
            .target-info:not(.leaflet-container):not(#map),
            .target-section:not(.leaflet-container):not(#map),
            .target-panel:not(.leaflet-container):not(#map),
            .target-legend:not(.leaflet-container):not(#map),
            .target-summary:not(.leaflet-container):not(#map) {
              display: none !important;
            }
            
            /* FORCE MAP AND MAIN CONTENT TO BE VISIBLE */
            body, html, 
            #map, .leaflet-container, .map-container,
            .leaflet-map-pane, .leaflet-tile-pane,
            .leaflet-objects-pane, .leaflet-shadow-pane,
            .info-panel, .stats-panel, .demographics-panel, 
            .wards-panel, .legend-panel:not(.target-legend), .control-panel,
            .data-panel, .floating-panel, .overlay-panel,
            .statistics, .demographics, .wards,
            .voter-info, .area-info {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              position: relative !important;
            }
            
            /* Ensure map takes proper space */
            #map, .leaflet-container {
              width: 100% !important;
              height: 100% !important;
              min-height: 400px !important;
            }
            
            /* Clean styling for visible elements */
            
            /* Clean up control buttons */
            button, .btn, .button, [class*="button"] {
              background: rgba(15, 23, 42, 0.95) !important;
              backdrop-filter: blur(16px) !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              border-radius: 8px !important;
              color: white !important;
              padding: 8px 12px !important;
              font-size: 14px !important;
              transition: all 0.2s ease !important;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
              margin: 4px !important;
            }
            
            button:hover, .btn:hover, .button:hover {
              background: rgba(30, 41, 59, 0.95) !important;
              border-color: rgba(255, 255, 255, 0.2) !important;
              transform: translateY(-1px) !important;
            }
            
            /* Organize control panels */
            .control-panel, .panel, [class*="panel"] {
              background: rgba(15, 23, 42, 0.95) !important;
              backdrop-filter: blur(16px) !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              border-radius: 12px !important;
              padding: 16px !important;
              margin: 8px !important;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
            }
            
            /* Clean up statistics and info displays */
            .stats, .info, .demographics, .wards, [class*="stats"], [class*="info"] {
              background: rgba(30, 41, 59, 0.8) !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              border-radius: 8px !important;
              padding: 12px !important;
              margin: 4px !important;
              color: white !important;
            }
            
            /* Organize positioning - keep elements but make them neat */
            .fixed, .absolute, [style*="position: fixed"], [style*="position: absolute"] {
              z-index: 10 !important;
            }
            
            /* Clean up text and typography */
            * {
              font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
            }
            
            /* Ensure proper spacing */
            body {
              padding: 8px !important;
              background: #0F172A !important;
            }
            
            /* Clean up leaflet controls */
            .leaflet-control-container {
              margin: 8px !important;
            }
            
            .leaflet-control {
              background: rgba(15, 23, 42, 0.95) !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              border-radius: 8px !important;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
            }
            
            .leaflet-control a {
              color: white !important;
              background: transparent !important;
            }
            
            .leaflet-control a:hover {
              background: rgba(255, 255, 255, 0.1) !important;
            }
          `;
          iframe.contentDocument.head.appendChild(style);
          
          // Hide breadcrumb and target areas elements by content
          setTimeout(() => {
            const allElements = iframe.contentDocument.querySelectorAll('*');
            allElements.forEach(el => {
              const text = el.textContent || '';
              
              // Hide breadcrumb navigation
              if ((text.includes('Kerala →') || text.includes('Zones →')) && 
                  text.length < 100 && // Only small navigation elements
                  !el.querySelector('.map') && // Don't hide if contains map
                  !el.querySelector('.panel') && // Don't hide if contains panels
                  !el.querySelector('.info')) { // Don't hide if contains info
                (el as HTMLElement).style.display = 'none';
              }
              
              // Hide target areas section - but preserve map elements
              if ((text.includes('Target Areas') || 
                  text.includes('🎯') ||
                  text.includes('✨') ||
                  text.includes('Win (371)') ||
                  text.includes('Opposition (76)') ||
                  text.includes('NA (742)') ||
                  text.includes('blinking animations') ||
                  (text.includes('Win') && text.includes('Opposition') && text.includes('NA') && text.length < 200)) &&
                  // DON'T hide if it's a map element
                  !el.id?.includes('map') &&
                  !el.className?.includes('leaflet') &&
                  !el.className?.includes('map') &&
                  !el.closest('#map') &&
                  !el.closest('.leaflet-container')) {
                (el as HTMLElement).style.display = 'none';
                (el as HTMLElement).style.visibility = 'hidden';
              }
              
              // Remove blinking/animation classes
              if (el.classList) {
                el.classList.remove('blink', 'blinking', 'animated', 'pulse', 'flash');
              }
            });
            
            // Set up MutationObserver to catch dynamically created target elements (but preserve map)
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as HTMLElement;
                    const text = element.textContent || '';
                    
                    // Hide any new target area elements but NOT map elements
                    if ((text.includes('Target Areas') || 
                        text.includes('🎯') ||
                        text.includes('✨') ||
                        text.includes('Win (371)') ||
                        text.includes('Opposition (76)') ||
                        text.includes('NA (742)') ||
                        text.includes('blinking animations')) &&
                        // DON'T hide map elements
                        !element.id?.includes('map') &&
                        !element.className?.includes('leaflet') &&
                        !element.className?.includes('map')) {
                      element.style.display = 'none';
                    }
                  }
                });
              });
            });
            
            observer.observe(iframe.contentDocument.body, {
              childList: true,
              subtree: true
            });
          }, 500);
        }
      } catch (error) {
        console.warn('Could not inject cleanup styles into iframe:', error);
      }
    }, 1500); // Increased timeout to ensure iframe is fully loaded
  };

  const handleIframeError = () => {
    console.error('❌ Map iframe failed to load');
    setIsLoading(false);
    setMapError(true);
  };

  // Enhanced modal handlers with loading state management
  const handleShowPerformance = async () => {
    setShowPerformanceModal(true);

    try {
      await performanceLoading.execute(async () => {
        // Preload required data for performance modal
        await Promise.all([
          dataLoader.loadACVoteShareData(),
          dataLoader.loadMandalVoteShareData(),
          dataLoader.loadLocalBodyVoteShareData()
        ]);
      });
    } catch (error) {
      console.error('Failed to load performance data:', error);
    }
  };

  const handleShowTargets = async () => {
    setShowTargetModal(true);

    try {
      await targetLoading.execute(async () => {
        // Preload required data for target modal
        await Promise.all([
          dataLoader.loadACTargetData(),
          dataLoader.loadMandalTargetData(),
          dataLoader.loadOrgDistrictTargetData(),
          dataLoader.loadZoneTargetData()
        ]);
      });
    } catch (error) {
      console.error('Failed to load target data:', error);
    }
  };

  const handleShowLeadership = async () => {
    console.log('🚀 Opening leadership modal...');
    console.log('📍 Current map context:', currentMapContext);
    
    // Log detailed state information
    console.log('🗂️ Current orgDistrictContacts state:', orgDistrictContacts);
    console.log('📊 orgDistrictContacts length:', orgDistrictContacts.length);
    
    const contactData = getContactData();
    console.log('📞 Contact data retrieved:', contactData);
    console.log('📞 Contact data length:', contactData.length);
    console.log('📞 Contact data structure:', JSON.stringify(contactData, null, 2));
    
    setShowLeadershipModal(true);

    try {
      await leadershipLoading.execute(async () => {
        // Preload required data for leadership modal
        await Promise.all([
          dataLoader.loadMandalContactData(),
          dataLoader.loadOrgDistrictContacts()
        ]);
      });
    } catch (error) {
      console.error('Failed to load leadership data:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      // Get current data based on context
      const voteShareData = getPerformanceData();
      const targetData = getTargetData();
      const contactData = getContactData();

      // Create title based on current context
      let title = 'Kerala Map Report';
      if (currentMapContext.zone) title += ` - ${currentMapContext.zone}`;
      if (currentMapContext.org) title += ` - ${currentMapContext.org}`;
      if (currentMapContext.ac) title += ` - ${currentMapContext.ac}`;
      if (currentMapContext.mandal) title += ` - ${currentMapContext.mandal}`;

      const pdfData = {
        context: currentMapContext,
        voteShareData: Array.isArray(voteShareData) ? voteShareData : undefined,
        targetData: Array.isArray(targetData) ? undefined : targetData,
        contactData: Array.isArray(contactData) ? contactData : undefined,
        title
      };

      // Use mobile PDF generator if on mobile device
      const success = mobileInfo.isMobile || mobileInfo.isTouchDevice
        ? await generateMapPDFMobile(pdfData)
        : await generateMapPDF(pdfData);

      if (!success) {
        console.error('PDF export failed');
        alert('Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error during PDF export:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div
      id="integrated-map-container"
      className={`relative w-full bg-gradient-primary ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} overflow-hidden`}
      style={{
        height: isFullscreen ? '100vh' : 'calc(100vh - 64px)',
        top: isFullscreen ? 0 : undefined
      }}
    >
      {/* Floating Background Elements - Matching Dashboard Theme */}
      <div className="floating-bg floating-bg-1"></div>
      <div className="floating-bg floating-bg-2"></div>
      <div className="floating-bg floating-bg-3"></div>
      {/* ORGANIZED DESIGN - Clean but functional */}
      
      {/* Organized Control Bar - Top */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 p-2 shadow-xl">
        <div className="flex items-center gap-2">
          {/* Map Controls */}
          <div className="flex items-center gap-1 pr-2 border-r border-slate-700/50">
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-md flex items-center justify-center transition-all duration-200"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? 
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg> :
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              }
            </button>
            
            <button
              onClick={refreshMap}
              className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-md flex items-center justify-center transition-all duration-200"
              title="Refresh Map"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
            </button>
          </div>

          {/* Data Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleShowPerformance}
              className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-700/80 text-white rounded-md flex items-center gap-1.5 transition-all duration-200 text-sm font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
              Performance
            </button>
            
            <button
              onClick={handleShowTargets}
              className="px-3 py-1.5 bg-orange-600/80 hover:bg-orange-700/80 text-white rounded-md flex items-center gap-1.5 transition-all duration-200 text-sm font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
              Targets
            </button>
            
            <button
              onClick={handleShowLeadership}
              className="px-3 py-1.5 bg-green-600/80 hover:bg-green-700/80 text-white rounded-md flex items-center gap-1.5 transition-all duration-200 text-sm font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="m22 21-3-3m0 0a2 2 0 1 0-2.828-2.828A2 2 0 0 0 19 18Z"/>
              </svg>
              Contacts
            </button>
            
            <button
              onClick={handleExportPDF}
              className="px-3 py-1.5 bg-slate-600/80 hover:bg-slate-700/80 text-white rounded-md flex items-center gap-1.5 transition-all duration-200 text-sm font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      {mobileInfo.isMobile && (
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={handleShowPerformance}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
            </svg>
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-gradient-primary flex items-center justify-center"
          style={{
            zIndex: 60, // Use loadingOverlay z-index
            marginLeft: mobileInfo.isMobile ? '0' : isControlPanelCollapsed ? '4rem' : '20rem'
          }}
        >
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500/30 border-t-orange-500 mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">
              Loading Kerala Map
            </h3>
            <p className="text-gray-300">Please wait while we load the interactive map data</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {mapError && (
        <div
          className="fixed inset-0 bg-gradient-primary flex items-center justify-center"
          style={{
            zIndex: 60, // Use loadingOverlay z-index
            marginLeft: mobileInfo.isMobile ? '0' : isControlPanelCollapsed ? '4rem' : '20rem'
          }}
        >
          <div className="text-center text-white p-6 glass-morphism rounded-2xl shadow-2xl max-w-md mx-4">
            <div className="text-red-400 mb-6">
              <MapPin size={48} className="mx-auto" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-4">
              Map Loading Error
            </h3>
            <p className="text-gray-300 mb-6">Unable to load the interactive map. Please try refreshing.</p>
            <button
              onClick={refreshMap}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ds-touch-target"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
              </svg>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Map Container - Full screen with space for control bar */}
      <div
        className="transition-all duration-300 relative"
        style={{
          marginLeft: '0',
          marginRight: '0',
          marginTop: isFullscreen ? '0' : '80px', // Space for control bar
          height: isFullscreen ? '100vh' : 'calc(100vh - 144px)', // Account for header + control bar
          zIndex: 1 // Base z-index for map content
        }}
      >
        <iframe
          ref={iframeRef}
          src="/map/pan.html"
          title="Kerala Interactive Map"
          className="w-full h-full border-none bg-gradient-primary touch-manipulation"
          style={{
            minHeight: mobileInfo.isMobile ? '350px' : '400px',
            backgroundColor: '#1F2937',
            touchAction: 'manipulation',
            userSelect: 'none',
            WebkitOverflowScrolling: 'touch',
            border: 'none',
            outline: 'none'
          }}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>

      {/* Performance Modal */}
      <PerformanceModal
        isOpen={showPerformanceModal}
        onClose={() => setShowPerformanceModal(false)}
        data={getPerformanceData()}
        title={
          currentMapContext.level === 'zones' ? 'Zone Wise Targets For 2025' :
            currentMapContext.level === 'orgs' ? `${currentMapContext.zone} Zone - Org District Targets For 2025` :
              'Performance Targets For 2025'
        }
        grandTotal={getGrandTotal()}
        isLoading={performanceLoading.isLoading}
        error={performanceLoading.error}
        onRetry={performanceLoading.retry}
      />

      {/* Leadership Modal */}
      <LeadershipModal
        isOpen={showLeadershipModal}
        onClose={() => setShowLeadershipModal(false)}
        contacts={getTransformedContactData()}
        title={(() => {
          const level = currentMapContext.level;
          if (level === 'zones') return 'Zone Leadership';
          if (level === 'orgs') return `${currentMapContext.zone} Zone - Org District Contacts`;
          if (level === 'acs') return `${currentMapContext.org} - AC Contacts`;
          if (level === 'mandals') return `${currentMapContext.org} - Mandal Contacts`;
          if (level === 'panchayats') return `${currentMapContext.mandal} - Local Body Contacts`;
          return 'Contact Information';
        })()}
        isLoading={leadershipLoading.isLoading}
        error={leadershipLoading.error}
        onRetry={leadershipLoading.retry}
      />

      {/* OLD LEADERSHIP MODAL - TO BE REMOVED */}
      {false && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700/50 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            {/* Modal Header - Mobile Optimized */}
            <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-700/50">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white sm:w-6 sm:h-6">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="m22 21-3-3m0 0a2 2 0 1 0-2.828-2.828A2 2 0 0 0 19 18Z"></path>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-2xl font-bold text-white truncate">
                    {(() => {
                      const level = currentMapContext.level;
                      if (level === 'zones') return 'Zone Leadership';
                      if (level === 'orgs') return `${currentMapContext.zone} Zone - Org District Contacts`;
                      if (level === 'acs') return `${currentMapContext.org} - AC Contacts`;
                      if (level === 'mandals') return `${currentMapContext.org} - Mandal Contacts`;
                      if (level === 'panchayats') return `${currentMapContext.mandal} - Local Body Contacts`;
                      return 'Contact Information';
                    })()}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {(() => {
                      const level = currentMapContext.level;
                      if (level === 'zones') return 'Zone Incharge & President Information';
                      if (level === 'orgs') return 'Org District Leadership Contacts';
                      if (level === 'acs') return 'No contact data available at AC level';
                      if (level === 'mandals') return 'Mandal President & Prabhari Contacts';
                      if (level === 'panchayats') return 'Local Body Leadership Contacts';
                      return 'Leadership contact information';
                    })()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLeadershipModal(false)}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {(() => {
                const contactData = getContactData();
                if (contactData === null) {
                  // AC level - no contact data
                  return (
                    <div className="text-center py-12">
                      <div className="p-4 bg-orange-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                          <circle cx="12" cy="12" r="10"></circle>
                          <circle cx="12" cy="12" r="6"></circle>
                          <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No Contact Data Available</h3>
                      <p className="text-gray-400">Contact information is not available at the AC level.</p>
                    </div>
                  );
                }

                if (Array.isArray(contactData) && contactData.length > 0) {
                  return (
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                      <div className="px-4 py-2 bg-gradient-to-r from-green-600/20 to-green-500/20 border-b border-gray-700/50">
                        <p className="text-sm text-green-300">
                          📞 <strong>Contact Information:</strong> {(() => {
                            const level = currentMapContext.level;
                            if (level === 'zones') return 'Zone-level leadership contacts';
                            if (level === 'orgs') return `Org District contacts for ${currentMapContext.zone}`;
                            if (level === 'mandals') return `Mandal contacts for ${currentMapContext.org}`;
                            if (level === 'panchayats') return `Local Body contacts for ${currentMapContext.mandal}`;
                            return 'Leadership contacts';
                          })()}
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-green-600/20 to-green-500/20">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-green-300 uppercase tracking-wider">
                                {(() => {
                                  const level = currentMapContext.level;
                                  if (level === 'zones') return 'Zones';
                                  if (level === 'orgs') return 'Org Districts';
                                  if (level === 'mandals') return 'Mandals';
                                  if (level === 'panchayats') return 'Local Bodies';
                                  return 'Name';
                                })()}
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
                                {(() => {
                                  const level = currentMapContext.level;
                                  if (level === 'panchayats') return 'President';
                                  if (level === 'mandals') return 'President';
                                  return 'Primary Contact';
                                })()}
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-orange-300 uppercase tracking-wider">
                                Phone
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-300 uppercase tracking-wider">
                                {(() => {
                                  const level = currentMapContext.level;
                                  if (level === 'panchayats') return 'Incharge';
                                  if (level === 'mandals') return 'Prabhari';
                                  return 'Secondary Contact';
                                })()}
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-blue-300 uppercase tracking-wider">
                                Phone
                              </th>
                              {(() => {
                                const level = currentMapContext.level;
                                if (level === 'panchayats') {
                                  return (
                                    <>
                                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-300 uppercase tracking-wider">
                                        Secretary
                                      </th>
                                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-300 uppercase tracking-wider">
                                        Phone
                                      </th>
                                    </>
                                  );
                                }
                                return null;
                              })()}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700/50">
                            {contactData.map((contact: any, index: number) => {
                              const level = currentMapContext.level;

                              // For local body contacts, use the specific structure with President, Incharge, and Secretary
                              if (level === 'panchayats') {
                                const presidentName = contact.president?.name || 'N/A';
                                const presidentPhone = contact.president?.phone || 'N/A';
                                const inchargeName = contact.incharge?.name || 'N/A';
                                const inchargePhone = contact.incharge?.phone || 'N/A';
                                const secretaryName = contact.secretary?.name || 'N/A';
                                const secretaryPhone = contact.secretary?.phone || 'N/A';

                                return (
                                  <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-white">
                                      <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="font-semibold">{contact.name}</span>
                                        </div>
                                        {contact.area && contact.area !== 'N/A' && (
                                          <div className="text-xs text-blue-300 font-medium bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                                            📍 {contact.area}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="text-orange-300 font-medium">
                                        {presidentName !== 'N/A' ? presidentName :
                                          <span className="text-gray-500 italic">Not Available</span>
                                        }
                                      </div>
                                      {presidentName !== 'N/A' && (
                                        <div className="text-xs text-gray-400">👑 President</div>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {presidentPhone !== 'N/A' ? (
                                        <a href={`tel:${presidentPhone}`}
                                          className="text-orange-300 hover:text-orange-200 transition-colors font-mono text-xs bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20 hover:border-orange-400/30">
                                          📞 {presidentPhone}
                                        </a>
                                      ) : (
                                        <span className="text-gray-500 text-xs">N/A</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="text-blue-300 font-medium">
                                        {inchargeName !== 'N/A' ? inchargeName :
                                          <span className="text-gray-500 italic">Not Available</span>
                                        }
                                      </div>
                                      {inchargeName !== 'N/A' && (
                                        <div className="text-xs text-gray-400">👤 Incharge</div>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {inchargePhone !== 'N/A' ? (
                                        <a href={`tel:${inchargePhone}`}
                                          className="text-blue-300 hover:text-blue-200 transition-colors font-mono text-xs bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 hover:border-blue-400/30">
                                          📞 {inchargePhone}
                                        </a>
                                      ) : (
                                        <span className="text-gray-500 text-xs">N/A</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="text-green-300 font-medium">
                                        {secretaryName !== 'N/A' ? secretaryName :
                                          <span className="text-gray-500 italic">Not Available</span>
                                        }
                                      </div>
                                      {secretaryName !== 'N/A' && (
                                        <div className="text-xs text-gray-400">📝 Secretary</div>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {secretaryPhone !== 'N/A' ? (
                                        <a href={`tel:${secretaryPhone}`}
                                          className="text-green-300 hover:text-green-200 transition-colors font-mono text-xs bg-green-500/10 px-2 py-1 rounded border border-green-500/20 hover:border-green-400/30">
                                          📞 {secretaryPhone}
                                        </a>
                                      ) : (
                                        <span className="text-gray-500 text-xs">N/A</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              }

                              // For mandal contacts, use the specific structure
                              if (level === 'mandals') {
                                const presidentName = contact.president?.name || 'N/A';
                                const presidentPhone = contact.president?.phone || 'N/A';
                                const prabhariName = contact.prabhari?.name || 'N/A';
                                const prabhariPhone = contact.prabhari?.phone || 'N/A';

                                return (
                                  <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-white">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        {contact.name}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="text-blue-300 font-medium">
                                        {presidentName !== 'N/A' ? presidentName :
                                          <span className="text-gray-500 italic">Not Available</span>
                                        }
                                      </div>
                                      {presidentName !== 'N/A' && (
                                        <div className="text-xs text-gray-400">President</div>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {presidentPhone !== 'N/A' ? (
                                        <a href={`tel:${presidentPhone}`}
                                          className="text-purple-300 hover:text-purple-200 transition-colors font-mono text-xs bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 hover:border-purple-400/30">
                                          📞 {presidentPhone}
                                        </a>
                                      ) : (
                                        <span className="text-gray-500 text-xs">N/A</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="text-yellow-300 font-medium">
                                        {prabhariName !== 'N/A' ? prabhariName :
                                          <span className="text-gray-500 italic">Not Available</span>
                                        }
                                      </div>
                                      {prabhariName !== 'N/A' && (
                                        <div className="text-xs text-gray-400">Prabhari</div>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {prabhariPhone !== 'N/A' ? (
                                        <a href={`tel:${prabhariPhone}`}
                                          className="text-orange-300 hover:text-orange-200 transition-colors font-mono text-xs bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20 hover:border-orange-400/30">
                                          📞 {prabhariPhone}
                                        </a>
                                      ) : (
                                        <span className="text-gray-500 text-xs">N/A</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              }

                              // For other contact types, use the original structure
                              return (
                                <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                                  <td className="px-4 py-3 text-sm font-medium text-white">{contact.name}</td>
                                  <td className="px-4 py-3 text-sm text-gray-300">
                                    {contact.incharge || contact.president?.name || contact.presidentName || 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-blue-300 font-mono">
                                    <a href={`tel:${contact.inchargePhone || contact.president?.phone || contact.presidentPhone || ''}`}
                                      className="hover:text-blue-200 transition-colors">
                                      {contact.inchargePhone || contact.president?.phone || contact.presidentPhone || 'N/A'}
                                    </a>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-300">
                                    {contact.president || contact.prabhari?.name || contact.inchargeName || 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-orange-300 font-mono">
                                    <a href={`tel:${contact.presidentPhone || contact.prabhari?.phone || contact.inchargePhone || ''}`}
                                      className="hover:text-orange-200 transition-colors">
                                      {contact.presidentPhone || contact.prabhari?.phone || contact.inchargePhone || 'N/A'}
                                    </a>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary Footer for Contact Statistics */}
                      {(currentMapContext.level === 'mandals' || currentMapContext.level === 'panchayats') && (
                        <div className="px-4 py-3 bg-gray-700/20 border-t border-gray-700/50">
                          <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>
                              {currentMapContext.level === 'mandals' ? `Total Mandals: ${contactData.length}` : `Total Local Bodies: ${contactData.length}`}
                            </span>
                            <div className="flex gap-4">
                              {currentMapContext.level === 'mandals' ? (
                                <>
                                  <span>
                                    Presidents with contacts: {contactData.filter((c: any) => c.president?.phone !== 'N/A').length}
                                  </span>
                                  <span>
                                    Prabharis with contacts: {contactData.filter((c: any) => c.prabhari?.phone !== 'N/A').length}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span>
                                    Presidents with contacts: {contactData.filter((c: any) => c.president?.phone !== 'N/A').length}
                                  </span>
                                  <span>
                                    Incharges with contacts: {contactData.filter((c: any) => c.incharge?.phone !== 'N/A').length}
                                  </span>
                                  <span>
                                    Secretaries with contacts: {contactData.filter((c: any) => c.secretary?.phone !== 'N/A').length}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Fallback for no data
                return (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="6"></circle>
                        <circle cx="12" cy="12" r="2"></circle>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Contact Data Available</h3>
                    <p className="text-gray-400">Please select a location to view contact information.</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Target Modal */}
      <TargetModal
        isOpen={showTargetModal}
        onClose={() => setShowTargetModal(false)}
        data={getTransformedTargetData()}
        title={(() => {
          const level = currentMapContext.level;
          if (level === 'zones') return 'Zone Level Targets';
          if (level === 'orgs') return `Org District Targets - ${currentMapContext.zone}`;
          if (level === 'acs') return `AC Targets - ${currentMapContext.org}`;
          if (level === 'mandals') return `Mandal Targets - ${currentMapContext.ac}`;
          return 'Target Overview';
        })()}
        showGrandTotal={true}
        isLoading={targetLoading.isLoading}
        error={targetLoading.error}
        onRetry={targetLoading.retry}
      />

    </div>
  );
};

export default IntegratedKeralaMap;
