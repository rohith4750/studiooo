// Comprehensive Indian States, Major Districts/Cities and Standard Postal Pincodes Database

export interface CityData {
  name: string;
  pincodes: string[];
}

export interface StateData {
  state: string;
  cities: CityData[];
}

export const INDIA_STATES_DATA: StateData[] = [
  {
    state: 'Andhra Pradesh',
    cities: [
      { name: 'Visakhapatnam', pincodes: ['530001', '530002', '530003', '530016', '530017', '530020', '530048'] },
      { name: 'Vijayawada', pincodes: ['520001', '520002', '520003', '520007', '520010', '520012'] },
      { name: 'Guntur', pincodes: ['522001', '522002', '522004', '522006', '522007'] },
      { name: 'Nellore', pincodes: ['524001', '524002', '524003', '524004'] },
      { name: 'Kurnool', pincodes: ['518001', '518002', '518003', '518004'] },
      { name: 'Kakinada', pincodes: ['533001', '533002', '533003', '533005'] },
      { name: 'Rajahmundry', pincodes: ['533101', '533102', '533103', '533105'] },
      { name: 'Tirupati', pincodes: ['517501', '517502', '517507'] },
      { name: 'Kadapa', pincodes: ['516001', '516002', '516004'] },
      { name: 'Anantapur', pincodes: ['515001', '515002', '515004'] },
      { name: 'Eluru', pincodes: ['534001', '534002', '534005'] },
      { name: 'Ongole', pincodes: ['523001', '523002'] },
      { name: 'Vizianagaram', pincodes: ['535001', '535002', '535003'] },
      { name: 'Machilipatnam', pincodes: ['521001', '521002'] },
      { name: 'Chittoor', pincodes: ['517001', '517002'] }
    ]
  },
  {
    state: 'Telangana',
    cities: [
      { name: 'Hyderabad', pincodes: ['500001', '500002', '500003', '500016', '500032', '500034', '500072', '500081', '500084'] },
      { name: 'Warangal', pincodes: ['506001', '506002', '506007', '506009'] },
      { name: 'Nizamabad', pincodes: ['503001', '503002', '503003'] },
      { name: 'Karimnagar', pincodes: ['505001', '505002'] },
      { name: 'Khammam', pincodes: ['507001', '507002', '507003'] },
      { name: 'Ramagundam', pincodes: ['505208', '505209'] },
      { name: 'Mahbubnagar', pincodes: ['509001', '509002'] },
      { name: 'Nalgonda', pincodes: ['508001', '508002'] },
      { name: 'Adilabad', pincodes: ['504001', '504002'] },
      { name: 'Siddipet', pincodes: ['502103', '502114'] },
      { name: 'Miryalaguda', pincodes: ['508207'] },
      { name: 'Suryapet', pincodes: ['508213'] }
    ]
  },
  {
    state: 'Karnataka',
    cities: [
      { name: 'Bengaluru', pincodes: ['560001', '560002', '560004', '560025', '560034', '560038', '560043', '560066', '560076', '560100'] },
      { name: 'Mysuru', pincodes: ['570001', '570004', '570008', '570012', '570020'] },
      { name: 'Hubballi-Dharwad', pincodes: ['580020', '580021', '580029', '580030'] },
      { name: 'Mangaluru', pincodes: ['575001', '575002', '575003', '575006'] },
      { name: 'Belagavi', pincodes: ['590001', '590002', '590016'] },
      { name: 'Kalaburagi', pincodes: ['585101', '585102', '585103'] },
      { name: 'Davanagere', pincodes: ['577001', '577002', '577004'] },
      { name: 'Ballari', pincodes: ['583101', '583102', '583103'] },
      { name: 'Shivamogga', pincodes: ['577201', '577202', '577204'] },
      { name: 'Tumakuru', pincodes: ['572101', '572102', '572103'] },
      { name: 'Udupi', pincodes: ['576101', '576102', '576104'] },
      { name: 'Hassan', pincodes: ['573201', '573202'] }
    ]
  },
  {
    state: 'Maharashtra',
    cities: [
      { name: 'Mumbai', pincodes: ['400001', '400002', '400004', '400012', '400050', '400053', '400058', '400076', '400092'] },
      { name: 'Pune', pincodes: ['411001', '411002', '411004', '411014', '411038', '411045', '411057'] },
      { name: 'Nagpur', pincodes: ['440001', '440002', '440010', '440012', '440022'] },
      { name: 'Thane', pincodes: ['400601', '400602', '400604', '400607', '400615'] },
      { name: 'Nashik', pincodes: ['422001', '422002', '422005', '422009'] },
      { name: 'Chhatrapati Sambhajinagar', pincodes: ['431001', '431003', '431005'] },
      { name: 'Solapur', pincodes: ['413001', '413002', '413004'] },
      { name: 'Navi Mumbai', pincodes: ['400703', '400705', '400706', '400708', '400709'] },
      { name: 'Kolhapur', pincodes: ['416001', '416002', '416003'] },
      { name: 'Amravati', pincodes: ['444601', '444602', '444604'] },
      { name: 'Nanded', pincodes: ['431601', '431602', '431605'] }
    ]
  },
  {
    state: 'Tamil Nadu',
    cities: [
      { name: 'Chennai', pincodes: ['600001', '600002', '600004', '600017', '600028', '600040', '600096'] },
      { name: 'Coimbatore', pincodes: ['641001', '641002', '641012', '641018', '641044'] },
      { name: 'Madurai', pincodes: ['625001', '625002', '625009', '625020'] },
      { name: 'Tiruchirappalli', pincodes: ['620001', '620002', '620017', '620018'] },
      { name: 'Salem', pincodes: ['636001', '636004', '636007', '636016'] },
      { name: 'Tirunelveli', pincodes: ['627001', '627002', '627006'] },
      { name: 'Erode', pincodes: ['638001', '638002', '638009', '638011'] },
      { name: 'Vellore', pincodes: ['632001', '632004', '632009'] },
      { name: 'Thoothukudi', pincodes: ['628001', '628002', '628008'] },
      { name: 'Thanjavur', pincodes: ['613001', '613005', '613007'] }
    ]
  },
  {
    state: 'Kerala',
    cities: [
      { name: 'Thiruvananthapuram', pincodes: ['695001', '695002', '695004', '695014', '695033'] },
      { name: 'Kochi', pincodes: ['682001', '682011', '682016', '682024', '682030'] },
      { name: 'Kozhikode', pincodes: ['673001', '673004', '673006', '673016'] },
      { name: 'Thrissur', pincodes: ['680001', '680004', '680020'] },
      { name: 'Kollam', pincodes: ['691001', '691008', '691013'] },
      { name: 'Alappuzha', pincodes: ['688001', '688006', '688011'] },
      { name: 'Palakkad', pincodes: ['678001', '678006', '678014'] },
      { name: 'Kannur', pincodes: ['670001', '670002', '670012'] },
      { name: 'Kottayam', pincodes: ['686001', '686002', '686004'] }
    ]
  },
  {
    state: 'Delhi (NCT)',
    cities: [
      { name: 'Central Delhi', pincodes: ['110001', '110002', '110005', '110006', '110055'] },
      { name: 'South Delhi', pincodes: ['110016', '110017', '110019', '110024', '110048', '110065'] },
      { name: 'West Delhi', pincodes: ['110015', '110018', '110026', '110027', '110058'] },
      { name: 'East Delhi', pincodes: ['110051', '110091', '110092', '110095'] },
      { name: 'North Delhi', pincodes: ['110007', '110009', '110036', '110054'] },
      { name: 'New Delhi', pincodes: ['110001', '110003', '110011', '110021', '110023'] }
    ]
  },
  {
    state: 'Gujarat',
    cities: [
      { name: 'Ahmedabad', pincodes: ['380001', '380006', '380009', '380015', '380054', '380058'] },
      { name: 'Surat', pincodes: ['395001', '395002', '395003', '395007', '395009'] },
      { name: 'Vadodara', pincodes: ['390001', '390005', '390007', '390015', '390020'] },
      { name: 'Rajkot', pincodes: ['360001', '360002', '360004', '360005'] },
      { name: 'Bhavnagar', pincodes: ['364001', '364002', '364004'] },
      { name: 'Jamnagar', pincodes: ['361001', '361002', '361005'] },
      { name: 'Gandhinagar', pincodes: ['382010', '382016', '382024'] },
      { name: 'Junagadh', pincodes: ['362001', '362002'] },
      { name: 'Anand', pincodes: ['388001', '388120'] }
    ]
  },
  {
    state: 'Rajasthan',
    cities: [
      { name: 'Jaipur', pincodes: ['302001', '302002', '302004', '302015', '302017', '302020'] },
      { name: 'Jodhpur', pincodes: ['342001', '342003', '342006', '342008'] },
      { name: 'Kota', pincodes: ['324001', '324005', '324007', '324009'] },
      { name: 'Bikaner', pincodes: ['334001', '334003', '334005'] },
      { name: 'Ajmer', pincodes: ['305001', '305004', '305007'] },
      { name: 'Udaipur', pincodes: ['313001', '313002', '313004'] },
      { name: 'Bhilwara', pincodes: ['311001', '311002'] },
      { name: 'Alwar', pincodes: ['301001', '301002'] },
      { name: 'Sikar', pincodes: ['332001', '332002'] }
    ]
  },
  {
    state: 'Uttar Pradesh',
    cities: [
      { name: 'Lucknow', pincodes: ['226001', '226002', '226010', '226016', '226024'] },
      { name: 'Kanpur', pincodes: ['208001', '208002', '208005', '208012', '208024'] },
      { name: 'Varanasi', pincodes: ['221001', '221002', '221005', '221010'] },
      { name: 'Agra', pincodes: ['282001', '282002', '282004', '282007'] },
      { name: 'Prayagraj (Allahabad)', pincodes: ['211001', '211002', '211003', '211006'] },
      { name: 'Noida', pincodes: ['201301', '201303', '201304', '201307', '201309'] },
      { name: 'Ghaziabad', pincodes: ['201001', '201002', '201009', '201012'] },
      { name: 'Meerut', pincodes: ['250001', '250002', '250004'] },
      { name: 'Bareilly', pincodes: ['243001', '243003', '243005'] },
      { name: 'Aligarh', pincodes: ['202001', '202002'] },
      { name: 'Moradabad', pincodes: ['244001', '244002'] },
      { name: 'Gorakhpur', pincodes: ['273001', '273005', '273015'] },
      { name: 'Mathura', pincodes: ['281001', '281003', '281004'] }
    ]
  },
  {
    state: 'West Bengal',
    cities: [
      { name: 'Kolkata', pincodes: ['700001', '700004', '700019', '700029', '700064', '700091'] },
      { name: 'Howrah', pincodes: ['711101', '711102', '711106', '711109'] },
      { name: 'Durgapur', pincodes: ['713201', '713204', '713216'] },
      { name: 'Asansol', pincodes: ['713301', '713303', '713304'] },
      { name: 'Siliguri', pincodes: ['734001', '734004', '734006'] },
      { name: 'Bardhaman', pincodes: ['713101', '713102', '713104'] },
      { name: 'Kharagpur', pincodes: ['721301', '721305'] }
    ]
  },
  {
    state: 'Punjab',
    cities: [
      { name: 'Ludhiana', pincodes: ['141001', '141002', '141008', '141012'] },
      { name: 'Amritsar', pincodes: ['143001', '143002', '143006'] },
      { name: 'Jalandhar', pincodes: ['144001', '144002', '144008'] },
      { name: 'Patiala', pincodes: ['147001', '147002', '147004'] },
      { name: 'Bathinda', pincodes: ['151001', '151005'] },
      { name: 'Mohali', pincodes: ['160055', '160059', '160062', '160071'] }
    ]
  },
  {
    state: 'Haryana',
    cities: [
      { name: 'Gurugram', pincodes: ['122001', '122002', '122018', '122022', '122051'] },
      { name: 'Faridabad', pincodes: ['121001', '121002', '121006', '121007'] },
      { name: 'Panipat', pincodes: ['132103', '132104', '132108'] },
      { name: 'Ambala', pincodes: ['133001', '134003'] },
      { name: 'Karnal', pincodes: ['132001', '132002'] },
      { name: 'Hisar', pincodes: ['125001', '125005'] },
      { name: 'Rohtak', pincodes: ['124001', '124002'] },
      { name: 'Panchkula', pincodes: ['134109', '134112', '134114'] }
    ]
  },
  {
    state: 'Madhya Pradesh',
    cities: [
      { name: 'Indore', pincodes: ['452001', '452002', '452010', '452016'] },
      { name: 'Bhopal', pincodes: ['462001', '462003', '462016', '462023'] },
      { name: 'Jabalpur', pincodes: ['482001', '482002', '482005'] },
      { name: 'Gwalior', pincodes: ['474001', '474002', '474006'] },
      { name: 'Ujjain', pincodes: ['456001', '456006', '456010'] },
      { name: 'Sagar', pincodes: ['470001', '470002'] },
      { name: 'Ratlam', pincodes: ['457001', '457002'] }
    ]
  },
  {
    state: 'Bihar',
    cities: [
      { name: 'Patna', pincodes: ['800001', '800002', '800013', '800020'] },
      { name: 'Gaya', pincodes: ['823001', '823002', '823003'] },
      { name: 'Bhagalpur', pincodes: ['812001', '812002'] },
      { name: 'Muzaffarpur', pincodes: ['842001', '842002'] },
      { name: 'Darbhanga', pincodes: ['846001', '846004'] },
      { name: 'Purnia', pincodes: ['854301', '854302'] }
    ]
  },
  {
    state: 'Odisha',
    cities: [
      { name: 'Bhubaneswar', pincodes: ['751001', '751002', '751010', '751024'] },
      { name: 'Cuttack', pincodes: ['753001', '753002', '753008'] },
      { name: 'Rourkela', pincodes: ['769001', '769004', '769012'] },
      { name: 'Berhampur', pincodes: ['760001', '760002'] },
      { name: 'Sambalpur', pincodes: ['768001', '768004'] },
      { name: 'Puri', pincodes: ['752001', '752002'] }
    ]
  },
  {
    state: 'Kerala',
    cities: [
      { name: 'Thiruvananthapuram', pincodes: ['695001', '695002', '695014'] },
      { name: 'Kochi', pincodes: ['682001', '682016', '682030'] },
      { name: 'Kozhikode', pincodes: ['673001', '673004'] }
    ]
  },
  {
    state: 'Assam',
    cities: [
      { name: 'Guwahati', pincodes: ['781001', '781005', '781022'] },
      { name: 'Silchar', pincodes: ['788001', '788005'] },
      { name: 'Dibrugarh', pincodes: ['786001', '786003'] },
      { name: 'Jorhat', pincodes: ['785001', '785006'] }
    ]
  },
  {
    state: 'Jharkhand',
    cities: [
      { name: 'Ranchi', pincodes: ['834001', '834002', '834009'] },
      { name: 'Jamshedpur', pincodes: ['831001', '831005', '831011'] },
      { name: 'Dhanbad', pincodes: ['826001', '826004'] },
      { name: 'Bokaro', pincodes: ['827001', '827004'] }
    ]
  },
  {
    state: 'Chhattisgarh',
    cities: [
      { name: 'Raipur', pincodes: ['492001', '492006', '492013'] },
      { name: 'Bhilai', pincodes: ['490006', '490020'] },
      { name: 'Bilaspur', pincodes: ['495001', '495004'] },
      { name: 'Korba', pincodes: ['495677', '495684'] }
    ]
  },
  {
    state: 'Uttarakhand',
    cities: [
      { name: 'Dehradun', pincodes: ['248001', '248006', '248011'] },
      { name: 'Haridwar', pincodes: ['249401', '249407'] },
      { name: 'Roorkee', pincodes: ['247667'] },
      { name: 'Haldwani', pincodes: ['263139', '263141'] },
      { name: 'Rishikesh', pincodes: ['249201'] }
    ]
  },
  {
    state: 'Goa',
    cities: [
      { name: 'Panaji', pincodes: ['403001', '403002'] },
      { name: 'Margao', pincodes: ['403601', '403602'] },
      { name: 'Vasco da Gama', pincodes: ['403802'] },
      { name: 'Mapusa', pincodes: ['403507'] },
      { name: 'Ponda', pincodes: ['403401'] }
    ]
  },
  {
    state: 'Chandigarh (UT)',
    cities: [
      { name: 'Chandigarh', pincodes: ['160017', '160019', '160022', '160036', '160047'] }
    ]
  },
  {
    state: 'Himachal Pradesh',
    cities: [
      { name: 'Shimla', pincodes: ['171001', '171002', '171004'] },
      { name: 'Dharamshala', pincodes: ['176215', '176216'] },
      { name: 'Mandi', pincodes: ['175001'] },
      { name: 'Solan', pincodes: ['173212'] },
      { name: 'Kullu / Manali', pincodes: ['175101', '175131'] }
    ]
  },
  {
    state: 'Jammu and Kashmir',
    cities: [
      { name: 'Srinagar', pincodes: ['190001', '190006', '190010'] },
      { name: 'Jammu', pincodes: ['180001', '180004', '180012'] },
      { name: 'Anantnag', pincodes: ['192101'] }
    ]
  }
];

// Helper functions for lookup & autofill
export function getStatesList(): string[] {
  return INDIA_STATES_DATA.map(s => s.state);
}

export function getCitiesByState(stateName: string): string[] {
  const match = INDIA_STATES_DATA.find(s => s.state.toLowerCase() === stateName.toLowerCase());
  return match ? match.cities.map(c => c.name) : [];
}

export function getPincodesByCity(cityName: string, stateName?: string): string[] {
  for (const s of INDIA_STATES_DATA) {
    if (stateName && s.state.toLowerCase() !== stateName.toLowerCase()) continue;
    const cityMatch = s.cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (cityMatch) return cityMatch.pincodes;
  }
  return [];
}

export function findLocationByPincode(pincode: string): { state: string; city: string } | null {
  const cleanPin = pincode.trim();
  if (cleanPin.length < 3) return null;
  
  for (const s of INDIA_STATES_DATA) {
    for (const c of s.cities) {
      if (c.pincodes.includes(cleanPin) || c.pincodes.some(p => p.startsWith(cleanPin))) {
        return { state: s.state, city: c.name };
      }
    }
  }
  return null;
}
