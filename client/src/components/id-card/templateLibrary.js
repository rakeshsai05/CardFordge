import NavyUniversityTemplate from './templates/NavyUniversityTemplate';
import EmeraldCampusTemplate from './templates/EmeraldCampusTemplate';
import CrimsonInstituteTemplate from './templates/CrimsonInstituteTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import CleanWhiteTemplate from './templates/CleanWhiteTemplate';
import CleanFrostTemplate from './templates/CleanFrostTemplate';
import DarkTemplate from './templates/DarkTemplate';
import HeritageCrestTemplate from './templates/HeritageCrestTemplate';
import TechSlateTemplate from './templates/TechSlateTemplate';
import ModernBlueTemplate from './templates/ModernBlueTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import {
  SchoolPortrait, HealthcarePortrait, CivicPortrait, EventPortrait, MemberPortrait,
  CorporateLandscape, IndustrialLandscape, HospitalityLandscape, PressLandscape, LogisticsLandscape,
  FinanceLandscape, LaboratoryPortrait, SecurityPortrait, NonprofitPortrait,
  SportsLandscape, RetailLandscape, VisitorLandscape,
} from './templates/SectorTemplates';

export const templateLibrary = [
  { id:'navy', name:'Institutional Classic', sector:'Education', orientation:'Portrait', concept:'Crested academic credential', accent:'bg-slate-800', component:NavyUniversityTemplate },
  { id:'emerald', name:'Emerald Campus', sector:'Education', orientation:'Portrait', concept:'Fresh academic profile', accent:'bg-emerald-700', component:EmeraldCampusTemplate },
  { id:'crimson', name:'Institute Crimson', sector:'Education', orientation:'Portrait', concept:'Formal institute pass', accent:'bg-rose-800', component:CrimsonInstituteTemplate },
  { id:'classicCard', name:'Classic Card', sector:'Education', orientation:'Portrait', concept:'Traditional member identity', accent:'bg-amber-700', component:ClassicTemplate },
  { id:'cleanWhite', name:'Clean White', sector:'Corporate', orientation:'Portrait', concept:'Quiet minimal profile', accent:'bg-slate-300', component:CleanWhiteTemplate },
  { id:'cleanFrost', name:'Frosted Blue', sector:'Corporate', orientation:'Portrait', concept:'Cool contemporary credential', accent:'bg-cyan-700', component:CleanFrostTemplate },
  { id:'darkCard', name:'Midnight Tech', sector:'Technology', orientation:'Portrait', concept:'Dark digital credential', accent:'bg-slate-950', component:DarkTemplate },
  { id:'heritageCrest', name:'Heritage Crest', sector:'Government', orientation:'Portrait', concept:'Insignia and formal hierarchy', accent:'bg-indigo-800', component:HeritageCrestTemplate },
  { id:'techSlate', name:'Tech Slate', sector:'Technology', orientation:'Portrait', concept:'Secure technology pass', accent:'bg-slate-700', component:TechSlateTemplate },
  { id:'modernBlue', name:'Modern Blue', sector:'Corporate', orientation:'Portrait', concept:'Contemporary blue profile', accent:'bg-sky-700', component:ModernBlueTemplate },
  { id:'minimalCard', name:'Minimal', sector:'Membership', orientation:'Portrait', concept:'Spacious minimalist layout', accent:'bg-zinc-400', component:MinimalTemplate },
  { id:'schoolAtlas', name:'Atlas Student', sector:'Education', orientation:'Portrait', concept:'Soft sky, round portrait, academic grid', accent:'bg-sky-600', component:SchoolPortrait },
  { id:'healthcare', name:'Care Team', sector:'Healthcare', orientation:'Portrait', concept:'Clinical side rail and staff profile', accent:'bg-teal-600', component:HealthcarePortrait },
  { id:'civicSeal', name:'Civic Authority', sector:'Government', orientation:'Portrait', concept:'Official seal and document hierarchy', accent:'bg-amber-700', component:CivicPortrait },
  { id:'eventPass', name:'Festival Pass', sector:'Events', orientation:'Portrait', concept:'Ticket composition with access marker', accent:'bg-orange-600', component:EventPortrait },
  { id:'memberClub', name:'Member Society', sector:'Membership', orientation:'Portrait', concept:'Editorial member profile in lavender', accent:'bg-violet-600', component:MemberPortrait },
  { id:'corporateGrid', name:'Executive Grid', sector:'Corporate', orientation:'Landscape', concept:'Portrait rail with structured employee grid', accent:'bg-blue-900', component:CorporateLandscape },
  { id:'industrialField', name:'Industrial Field', sector:'Industrial', orientation:'Landscape', concept:'High contrast site access credential', accent:'bg-orange-500', component:IndustrialLandscape },
  { id:'hotelAtelier', name:'Hotel Atelier', sector:'Hospitality', orientation:'Landscape', concept:'Warm editorial hospitality profile', accent:'bg-emerald-900', component:HospitalityLandscape },
  { id:'pressPass', name:'Press Credential', sector:'Media', orientation:'Landscape', concept:'Photo-led editorial accreditation', accent:'bg-slate-900', component:PressLandscape },
  { id:'logisticsFleet', name:'Fleet Access', sector:'Transport', orientation:'Landscape', concept:'Operations grid with vertical fleet rail', accent:'bg-cyan-700', component:LogisticsLandscape },
  { id:'financeTrust', name:'Private Banking', sector:'Finance', orientation:'Landscape', concept:'Classic trust mark with discreet profile', accent:'bg-emerald-900', component:FinanceLandscape },
  { id:'laboratory', name:'Research Lab', sector:'Science', orientation:'Portrait', concept:'Lab access rail and research clearance grid', accent:'bg-cyan-700', component:LaboratoryPortrait },
  { id:'securityOfficer', name:'Security Officer', sector:'Security', orientation:'Portrait', concept:'High contrast authority portrait with credential footer', accent:'bg-amber-700', component:SecurityPortrait },
  { id:'communityAid', name:'Community Aid', sector:'Nonprofit', orientation:'Portrait', concept:'Human centered volunteer profile with arch portrait', accent:'bg-emerald-700', component:NonprofitPortrait },
  { id:'sportsClub', name:'Sports Club', sector:'Sports', orientation:'Landscape', concept:'Action portrait with jersey number and season grid', accent:'bg-blue-900', component:SportsLandscape },
  { id:'retailTeam', name:'Retail Team', sector:'Retail', orientation:'Landscape', concept:'Store team identity with three point access grid', accent:'bg-amber-700', component:RetailLandscape },
  { id:'visitorAccess', name:'Visitor Pass', sector:'Access', orientation:'Landscape', concept:'Temporary access with prominent expiry and QR', accent:'bg-sky-700', component:VisitorLandscape },
];

export const templateById = Object.fromEntries(templateLibrary.map(template => [template.id, template]));
const legacyTemplateIds = {
  blue:'modernBlue', modern:'modernBlue', dark:'darkCard', tech:'techSlate',
  white:'cleanWhite', clean:'cleanWhite', minimal:'minimalCard', green:'emerald',
  frost:'cleanFrost', mint:'emerald', classic:'classicCard', heritage:'heritageCrest', royal:'crimson',
};
export const getTemplate = (id) => templateById[legacyTemplateIds[id] || id] || templateById.navy;
