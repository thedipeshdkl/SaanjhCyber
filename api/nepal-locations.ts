/**
 * Nepal administrative division data for reverse geocoding name-matching.
 * This module exports the same location arrays used in the frontend Report form
 * so the backend can validate/match OSM Nominatim responses to our canonical names.
 */

export const provinces: string[] = [
  "Koshi Pradesh",
  "Madhesh Pradesh",
  "Bagmati Pradesh",
  "Gandaki Pradesh",
  "Lumbini Pradesh",
  "Karnali Pradesh",
  "Sudurpashchim Pradesh",
];

export const districts: Record<string, string[]> = {
  "Koshi Pradesh": [
    "Jhapa", "Ilam", "Panchthar", "Taplejung", "Morang", "Sunsari",
    "Dhankuta", "Terhathum", "Sankhuwasabha", "Bhojpur", "Solukhumbu",
    "Okhaldhunga", "Khotang", "Udayapur",
  ],
  "Madhesh Pradesh": [
    "Saptari", "Siraha", "Dhanusha", "Mahottari", "Sarlahi",
    "Rautahat", "Bara", "Parsa",
  ],
  "Bagmati Pradesh": [
    "Kathmandu", "Lalitpur", "Bhaktapur", "Kavrepalanchok", "Dhading",
    "Nuwakot", "Sindhupalchok", "Makwanpur", "Chitwan", "Ramechhap",
    "Dolakha", "Sindhuli", "Rasuwa",
  ],
  "Gandaki Pradesh": [
    "Kaski", "Lamjung", "Tanahu", "Gorkha", "Syangja",
    "Nawalparasi East", "Manang", "Mustang", "Myagdi", "Parbat", "Baglung",
  ],
  "Lumbini Pradesh": [
    "Rupandehi", "Kapilvastu", "Palpa", "Arghakhanchi", "Gulmi",
    "Nawalparasi West", "Dang", "Banke", "Bardiya", "Rolpa", "Pyuthan",
  ],
  "Karnali Pradesh": [
    "Surkhet", "Dailekh", "Jajarkot", "Dolpa", "Jumla",
    "Kalikot", "Mugu", "Humla", "Salyan", "Rukum West",
  ],
  "Sudurpashchim Pradesh": [
    "Kailali", "Kanchanpur", "Dadeldhura", "Baitadi", "Darchula",
    "Bajhang", "Bajura", "Achham", "Doti",
  ],
};

export const municipalities: Record<string, string[]> = {
  "Kathmandu": [
    "Kathmandu Metropolitan City", "Kirtipur Municipality",
    "Kageshwari Manohara", "Budhanilkantha", "Tokha", "Tarakeshwar",
    "Gokarneshwar", "Chandragiri", "Nagarjun", "Dakshinkali",
  ],
  "Lalitpur": [
    "Lalitpur Metropolitan City", "Godawari Municipality",
    "Mahalaxmi Municipality", "Konjyosom Rural Municipality",
  ],
  "Bhaktapur": [
    "Bhaktapur Municipality", "Madhyapur Thimi Municipality",
    "Suryabinayak Municipality", "Changunarayan Municipality",
  ],
  "Kavrepalanchok": [
    "Dhulikhel Municipality", "Banepa Municipality",
    "Panauti Municipality", "Panchkhal Municipality",
  ],
  "Jhapa": [
    "Birtamod Municipality", "Mechinagar Municipality",
    "Damak Municipality", "Bhadrapur Municipality", "Kankai Municipality",
  ],
  "Morang": [
    "Biratnagar Metropolitan City", "Sundar Haraicha Municipality",
    "Urlabari Municipality", "Pathari-Shanischare Municipality",
  ],
  "Sunsari": [
    "Itahari Sub-Metropolitan City", "Dharan Sub-Metropolitan City",
    "Inaruwa Municipality",
  ],
  "Kaski": [
    "Pokhara Metropolitan City", "Annapurna Rural Municipality",
    "Machhapuchhre Rural Municipality",
  ],
  "Rupandehi": [
    "Butwal Sub-Metropolitan City", "Siddharthanagar Municipality",
    "Tilottama Municipality", "Devdaha Municipality",
  ],
  "Chitwan": [
    "Bharatpur Metropolitan City", "Ratnanagar Municipality",
    "Rapti Municipality", "Khairahani Municipality",
  ],
  "Dhanusha": [
    "Janakpur Sub-Metropolitan City", "Dhanushadham Municipality",
    "Chhireshwornath Municipality",
  ],
  "Kailali": [
    "Dhangadhi Sub-Metropolitan City", "Tikapur Municipality",
    "Ghodaghodi Municipality", "Lamki-Chuha Municipality",
  ],
  "Surkhet": [
    "Birendranagar Municipality", "Gurbhakot Municipality",
    "Lekbeshi Municipality",
  ],
  "Banke": ["Nepalgunj Sub-Metropolitan City", "Kohalpur Municipality"],
  "Dang": [
    "Ghorahi Sub-Metropolitan City", "Tulsipur Sub-Metropolitan City",
    "Lamahi Municipality",
  ],
  "Tanahu": [
    "Damauli Municipality", "Bhimad Municipality",
    "Shuklagandaki Municipality",
  ],
  "Gorkha": ["Gorkha Municipality", "Palungtar Municipality"],
  "Makwanpur": ["Hetauda Sub-Metropolitan City", "Thaha Municipality"],
  "Kanchanpur": [
    "Mahendranagar Municipality", "Bhimdatt Municipality",
    "Punarbas Municipality",
  ],
  "Bara": [
    "Kalaiya Sub-Metropolitan City",
    "Jeetpur-Simara Sub-Metropolitan City",
  ],
  "Parsa": ["Birgunj Metropolitan City", "Pokhariya Municipality"],
  "Ilam": ["Ilam Municipality", "Deumai Municipality", "Mai Municipality"],
  "Saptari": [
    "Rajbiraj Municipality", "Kanchanrup Municipality",
    "Bodebarsain Municipality",
  ],
  "Siraha": [
    "Siraha Municipality", "Lahan Municipality", "Golbazar Municipality",
  ],
  "Lamjung": [
    "Besisahar Municipality", "Sundarbazar Municipality",
    "Rainas Municipality",
  ],
  "Syangja": [
    "Putalibazar Municipality", "Waling Municipality",
    "Chapakot Municipality",
  ],
  "Palpa": ["Tansen Municipality", "Rampur Municipality"],
  "Gulmi": ["Tamghas Municipality", "Resunga Municipality"],
  "Kapilvastu": [
    "Kapilvastu Municipality", "Buddhabhumi Municipality",
    "Shivaraj Municipality",
  ],
  "Dailekh": ["Narayan Municipality", "Dullu Municipality"],
  "Bajhang": ["Jayaprithvi Municipality"],
  "Achham": ["Mangalsen Municipality", "Sanfebagar Municipality"],
  "Doti": ["Dipayal-Silgadhi Municipality"],
  "Baitadi": ["Dasharathchand Municipality", "Patan Municipality"],
  "Darchula": ["Mahakali Municipality", "Shailyashikhar Municipality"],
};

/**
 * Returns a flat list of all district names across all provinces.
 */
export function getAllDistricts(): string[] {
  return Object.values(districts).flat();
}

/**
 * Given a district name, returns the province it belongs to.
 */
export function getProvinceForDistrict(districtName: string): string | null {
  for (const [province, districtList] of Object.entries(districts)) {
    if (districtList.some(d => d.toLowerCase() === districtName.toLowerCase())) {
      return province;
    }
  }
  return null;
}
