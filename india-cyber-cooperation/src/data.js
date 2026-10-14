// Content data for the briefing. All figures come from the Department's own
// reports (2023–2026), the NDU letter 01/1171 of 9 Oct 2026, the C-DAC delivery
// and installation reports, and the 2025 CSTC presentation. Entries with
// `sample: true` are NOT in the records and must be confirmed or replaced.
module.exports = {
  event: { dateLabel: "Ulaanbaatar · 2026" },
  contact: "Head of Department: Captain S. Bilegt · www.mndu.gov.mn",

  delegation: [
    { name: "Ms Ishita Ganguli Tripathy", role: "Joint Secretary, Ministry of Defence" },
    { name: "Mr Vikash Kumar", role: "Director" },
    { name: "Col Baljit Singh", role: "Director" },
    { name: "Col Mupparty Sanjeev", role: "Defence Attaché, Embassy of India, Ulaanbaatar" },
  ],

  // establishment timeline (slide 8)
  establishment: [
    ["17 May 2015", "Intergovernmental Memorandum", "Governments of Mongolia and India agree to establish a Cyber Security Training Centre at the Ministry of Defence of Mongolia"],
    ["2021", "Site prepared, equipment shipped", "First floor of the Military Institute building at NDU renovated; two containers dispatched from India (Jul–Nov 2021)"],
    ["Feb 2022", "Delivery to NDU", "93 types of equipment, software and furniture received in Ulaanbaatar"],
    ["Mar–Jul 2022", "Installation and commissioning", "C-DAC engineer Sandeep Kumar with the NDU team; LMS and course content installed 20 Jul 2022"],
    ["6 Sep 2022", "Inauguration", "Defence Minister G. Saikhanbayar and Raksha Mantri Shri Rajnath Singh open the Centre"],
    ["Jan 2023", "Centre staffed", "Head and three teachers appointed (five posts) under the NDU Training Department"],
    ["Aug 2023", "First Indian training team", "Mobile training teams of two instructors rotate every four months"],
    ["Jul 2025", "University department", "Centre becomes the Cyber Security Department of the Military Institute, NDU"],
  ],

  // India's contribution (slide 9), MNT millions
  contribution: {
    total: "₮1.3 bn",
    totalLabel: "value of Indian supplies (MNT 1,303 million)",
    parts: [
      ["₮984.0 m", "equipment, furniture and materials – 93 items in two containers"],
      ["₮68.9 m", "cyber security software and tools – 5 product families"],
      ["₮250.4 m", "C-DAC e-learning system and course content"],
    ],
    systems: [
      ["FaServer", "Compute and network", "7 Cisco UCS C240 servers, NetApp SAN, Cisco switches, WatchGuard M470 firewall and IPS, 37 HP EliteDesk workstations"],
      ["FaSearch", "Digital forensics", "Tableau duplicators and write-blockers, Cellebrite UFED, Oxygen Forensics, FTK, forensic workstations, Faraday bags"],
      ["FaUserSecret", "Malware analysis", "IDA Pro, Hex-Rays x86/x64 decompilers, Sandboxie"],
      ["FaShieldAlt", "Incident response and audit", "Belkasoft, F-Response, Splunk, Nessus, Burp Suite, Acunetix, Netsparker"],
      ["FaBookOpen", "E-learning", "C-DAC LMS with five courses: awareness, network security, cyber crime investigation, cyber forensics, mobile forensics"],
      ["FaMobileAlt", "Cyber forensic tool kits", "CyberCheck, MobileCheck, CDR analyser, SIMXtractor, network session analysers"],
    ],
  },

  // learning environment (slide 10)
  rooms: [
    ["lab_forensic.jpg", "Digital forensics laboratory", "12 workstations"],
    ["lab_malware.jpg", "Malware analysis laboratory", "14 workstations"],
    ["lab_incident.jpg", "Incident and audit laboratory", "11 workstations"],
    ["lecture_hall.jpg", "Lecture hall", "34 seats, smart board, 2 displays"],
    ["library.jpg", "Library", "Textbooks and study desks"],
    ["staff_room.jpg", "Staff room", "8 instructor desks"],
    ["server_room.jpg", "Data centre", "2 racks, servers, SAN, firewall"],
    ["head_office.jpg", "Head of department", "Office and meeting table"],
  ],

  // Mongolian faculty (slide 11)
  faculty: [
    ["Captain S. Bilegt", "Head of Department (since Jan 2023)"],
    ["Lt Ch. Enkhbaatar", "Senior teacher · trained in India 2024–25 · MSc 2026"],
    ["Dr E. Munkhtsetseg", "Senior teacher · PhD 2026"],
    ["Lt D. Khulan", "Teacher · MSc 2026"],
    ["Ts. Ochir-Erdene", "Teacher"],
    ["G. Enkhtuul", "Teacher"],
    ["J. Munguntsetseg", "Teacher"],
  ],

  // Indian teams (slide 12)
  teams: [
    { team: "C-DAC", period: "Mar 2022 – Apr 2023", who: "Sandeep Kumar; resident engineers Vikash Sharma, Taranjeet Singh", courses: "Installation and commissioning (13 months); teacher training Sep–Oct 2022; laboratory tools course Apr 2023" },
    { team: "1", period: "Sep – Dec 2023", who: "Gp Capt (Dr) M.K. Sharma, Sgt Vinod Kumar Sharma", courses: "Instructor programme (4 modules); network security; malware analysis" },
    { team: "2", period: "Jan – Apr 2024", who: "Gp Capt Saurabh Malhotra, Sgt Durairaj A.", courses: "Cyber security basic course (networking, network security, cyber security)" },
    { team: "3", period: "May – Aug 2024", who: "Wg Cdr P.A. Siddapur, Hav Amal Raj", courses: "Ethical hacking (10 weeks)" },
    { team: "4", period: "Sep – Dec 2024", who: "Wg Cdr Rakesh Kumar Siwal, Sgt Mohit Panchal", courses: "SOC analyst; digital forensics" },
    { team: "5", period: "Jan – Apr 2025", who: "Lt Cdr Vikash, Sgt Rajendra Kumar Jat", courses: "Network administration; cryptography and data security" },
    { team: "6", period: "May – Aug 2025", who: "Lt Cdr Shubham Singh, Hav Ponnaganti Srinivasulu", courses: "Vulnerability assessment and penetration testing; cyber security audit" },
    { team: "7", period: "Sep – Dec 2025", who: "Wg Cdr Kishore Yadav, PO Harisankar P.P.", courses: "Foundation of cyber security (10 weeks): OS, network security, programming, data security, red/blue team" },
    { team: "8", period: "Dec 2025 – Mar 2026", who: "Names per department records", courses: "Blue team: SOC analyst, malware analysis, digital forensics, audit", sample: true },
    { team: "9", period: "Mar – Jul 2026", who: "Names per department records", courses: "Advanced: VAPT, CERT operations, military cyber security operations", sample: true },
  ],

  // trainees per course (slide 14) – from the Centre's training records
  courses: [
    ["2022 · Teacher training (C-DAC)", 12],
    ["2023 · Laboratory tools course", 10],
    ["2023 · Instructor programme", 17],
    ["2023 · Network security", 18],
    ["2023 · Malware analysis", 16],
    ["2024 · Cyber security basic", 24],
    ["2024 · Ethical hacking", 15],
    ["2024 · SOC analyst", 11],
    ["2024 · Digital forensics", 9],
    ["2025 · Network administration", 22],
    ["2025 · Cryptography & data security", 17],
    ["2025 · Vulnerability assessment & pentest", 21],
    ["2025 · Cyber security audit", 19],
  ],
  totals: [
    { value: "300+", label: "specialists of military and law-enforcement agencies trained with Indian teams, 2022–2026 (NDU letter, Oct 2026)" },
    { value: "211", label: "trainees in the 13 cohorts charted here (Sep 2022 – Jun 2025); the 7th–9th team cycles add the balance" },
    { value: "20", label: "credits of specialised training delivered with the Indian team in the first half of 2026 alone" },
  ],

  // joint training plan phases (slide 15)
  phases: [
    ["1", "Sep–Dec 2023", "Instructor programme · Certificate course (network security, malware analysis)"],
    ["2", "Jan–Apr 2024", "Basic and intermediate cyber security: networking, network security, cyber security"],
    ["3", "May–Aug 2024", "Certified Ethical Hacker (12 weeks) · Coding basics (4 weeks)"],
    ["4", "Sep–Dec 2024", "Malware analysis (8 weeks) · Digital forensics (8 weeks)"],
    ["5", "Jan–Apr 2025", "Network administrator (8 weeks) · Data security · Cryptography"],
    ["6", "May–Aug 2025", "Vulnerability assessment and penetration testing (12 weeks) · Cyber security audit"],
    ["7", "Sep–Dec 2025", "Foundation: operating systems, network security, programming, data security and cryptography, red/blue team concepts"],
    ["8", "Dec 2025–Mar 2026", "Defensive (Blue Team): SOC analyst, malware analysis, digital forensics, cyber security audit"],
    ["9", "Mar–Jul 2026", "Advanced: VAPT (5 weeks), CERT operations (5 weeks), military cyber security operations (4 weeks)"],
  ],

  // who we train (slide 16)
  audiences: [
    ["FaShieldAlt", "Cyber Security Military Command of the Armed Forces – principal partner; its officers formed the first cohorts (2023)"],
    ["FaUsers", "Armed Forces units and the General Staff – e.g. awareness training for units 016 and 011 (2025–2026)"],
    ["FaUniversity", "NDU faculty, cadets and students – instructor programme (2023) and 156–162 credits of bachelor teaching a year"],
    ["FaGavel", "Law-enforcement and security agencies – General Intelligence Agency, State Special Protection, Capital Emergency Department"],
    ["FaBuilding", "National programmes – executor of the National Security Council's cyber capacity programme (2025)"],
  ],
  reach: [
    { value: "8", label: "training contracts with agencies and individuals for paid specialised courses (2025–2026)" },
    { value: "22", label: "high-school pupils certified in the 2025 career-outreach programme" },
    { value: "3", label: "bachelor programmes run by the Department: cyber security, network engineering, software engineering (military)" },
    { value: "27 May 2026", label: "state examination of the first civilian cyber security bachelor cohort" },
  ],

  // research (slide 17)
  research: [
    ["FaBookOpen", "8 English-language textbooks with ISBN (2025)", "Network security, malware analysis, digital forensics, SOC analyst, network administrator, data security and cryptography, web security, information systems audit – 20 copies each in the NDU library"],
    ["FaLightbulb", "BEKHI learning system", "Developed by the faculty; in use since 2025–26 with BigBlueButton, Articulate 360 and H5P. Best innovation, NDU Academic Conference 2025; 2nd place, Defence Minister's STI award 2025"],
    ["FaFlask", "Publications and conferences", "8 journal articles in 2025 (MN/EN/RU); sector conference 'Cyber security: current state, change and reform', 2–3 Feb 2026, with five universities and academies"],
    ["FaTrophy", "Competitions", "DefendX-2024 and DefendX-2026 skills competitions; 1st place at the 14th National Computer Network Olympiad 2026 (cadet B. Bat-Orgil)"],
  ],

  // faculty development & partners (slide 18)
  development: [
    "Lt Ch. Enkhbaatar completed a cyber security professional course in India (2024–25)",
    "One PhD and two master's degrees defended by the faculty (2026)",
    "Short courses in Germany, Japan and the USA (2026); APNIC network security training",
    "Pacific Endeavor 2023 (US INDOPACOM); ITACTIC incident-response command-post exercise and the Asia-Pacific cyber exercise (2025)",
  ],
  partners: [
    "Cyber Security Military Command – joint training with US INDOPACOM cyber specialists (2025), DefendX competitions",
    "National Security Council working office – executor of the national cyber capacity programme (2025)",
    "MNCERT/CC, MUST, NUM, Internal Affairs University, Network Engineers' Association",
    "Industry – 'Cyber and Digital Defense' day with Ember Cyber Service (Jan 2026); cadet internships at the national CERT, ICN and Unitel",
  ],

  // 2025 upgrade (slide 19)
  upgrade: {
    order: "Supply order IDS/DCyA/D/Mongolia/2025-26 of 10 June 2025 – Defence Cyber Agency and C-DAC",
    tiles: [
      ["37", "workstations upgraded: 16 GB RAM, 2 GB graphics card and 1 TB disk each – commissioned 6 Nov 2025"],
      ["15", "software products renewed or newly licensed, activated 30 Sep – 7 Nov 2025"],
      ["2", "shipments cleared through Mongolian customs, 7 Sep and 13 Oct 2025"],
    ],
    software: [
      ["Forensics", "Exterro FTK · Cellebrite Inseyets · Oxygen Detective · Belkasoft Evidence Center · F-Response Tactical · Stellar Data Recovery"],
      ["Malware and vulnerability", "IDA Pro · Nessus Pro (128 IPs) · Burp Suite ×5 · Acunetix · Invicti"],
      ["Platform", "VMware vSphere Foundation · VMware Workstation Pro ×10 · Red Hat Enterprise Linux ×5 · WatchGuard M470 subscription ×2"],
    ],
  },

  // milestones (slide 20)
  events: [
    { date: "Sep 2022", title: "Centre inaugurated", detail: "Raksha Mantri's first visit to Mongolia", kind: "india" },
    { date: "Jan 2023", title: "Centre staffed", detail: "Head and three teachers appointed by the MoD", kind: "mongolia" },
    { date: "Feb 2023", title: "11th Joint Working Group", detail: "New Delhi – first in-person JWG after the pandemic", kind: "joint" },
    { date: "Aug 2023", title: "First training team", detail: "Indian mobile training teams begin four-month rotations", kind: "india" },
    { date: "May 2024", title: "12th Joint Working Group", detail: "Ulaanbaatar; 2024–2026 joint training plan approved", kind: "joint" },
    { date: "2024", title: "Ambassador's visit", detail: "Indian Ambassador reviews the Centre and upgrade needs", kind: "india" },
    { date: "Feb 2025", title: "13th Joint Working Group", detail: "New Delhi", kind: "joint" },
    { date: "Jul 2025", title: "University department", detail: "Centre becomes the Cyber Security Department", kind: "mongolia" },
    { date: "Oct 2025", title: "State visit to India", detail: "70 years of relations; Defence Wing in Ulaanbaatar announced", kind: "joint" },
    { date: "Nov 2025", title: "Upgrade commissioned", detail: "Hardware and licence renewal; Defence Attaché visits the Department", kind: "india" },
    { date: "Jul 2026", title: "Project phase completed", detail: "Instructor deployment extended to 2029 under the MoU", kind: "joint" },
    { date: "2026", title: "14th Joint Working Group", detail: "Ulaanbaatar – delegation visits the Department", kind: "joint" },
  ],

  // lessons (slide 21)
  worked: [
    "Shared model: Indian technology, curriculum and instructors; Mongolian premises, staff and management",
    "Resident C-DAC engineers for 13 months – courses started within weeks of inauguration",
    "A jointly approved three-year training plan (2024–2026) with two-instructor teams rotating every four months",
    "Course programmes written in English and Mongolian and run under MoD and NDU orders",
    "Trainees drawn from the whole military and law-enforcement sector",
    "India's 2025 licence and hardware renewal kept the laboratories current",
  ],
  challenges: [
    "2023 review: faculty at 100% load while classrooms were 50% used – more instructors needed (addressed by the 2025 restructuring into a department)",
    "Nationally recognised professional certification for the Centre's courses is still pending",
    "No cyber range or online training platform for units outside Ulaanbaatar – requested since 2024",
    "Budget limits: the 2025 sector conference and the 2026 e-learning research laboratory (MNT 30 m) were postponed",
    "Continuity between four-month instructor rotations",
    "The project phase ended in July 2026 – a Phase II framework is needed beyond instructor deployment",
  ],

  // proposals (slide 23) – NDU letter 01/1171, 9 Oct 2026
  proposals: [
    ["FaGraduationCap", "1 · Joint education", ["Joint bachelor, master's and doctoral programmes in cyber security", "Exchange of faculty, cadets and researchers", "Double-degree programmes with Indian universities"]],
    ["FaServer", "2 · Laboratories and research", ["Cyber Range and Security Operations Centre laboratory", "Joint research centre: IoT, AI, big data, quantum cryptography", "Cyber security laboratory for UAV and remotely operated systems"]],
    ["FaChalkboardTeacher", "3 · Faculty capacity", ["Train Mongolian faculty and researchers at Indian defence universities and research institutions", "Joint programme for cyber security instructors"]],
    ["FaGlobeAsia", "4 · International cooperation", ["Joint participation in ITU Cyberdrill, FIRST and APCERT exercises", "Biennial Mongolia–India Cyber Security Forum", "Regular joint conferences, seminars, courses and exercises"]],
  ],

  // roadmap (slide 24)
  roadmap: [
    { label: "Indian training teams (to 2029 under the MoU)", bars: [{ start: 2026, end: 2030, text: "continuous four-month rotations", kind: "india" }] },
    { label: "Cyber Range and SOC laboratory", bars: [{ start: 2027, end: 2028, text: "assessment, design", kind: "joint" }, { start: 2028, end: 2029, text: "install, commission", kind: "india" }] },
    { label: "Joint and double-degree programmes", bars: [{ start: 2027, end: 2028, text: "design, accredit", kind: "joint" }, { start: 2028, end: 2031, text: "first intakes", kind: "mongolia" }] },
    { label: "Faculty training in India", bars: [{ start: 2027, end: 2031, text: "two faculty a year", kind: "india" }] },
    { label: "Joint research centre (IoT, AI, quantum)", bars: [{ start: 2028, end: 2031, text: "establish and operate", kind: "joint" }] },
    { label: "Mongolia–India Cyber Security Forum", bars: [{ start: 2027, end: 2028, text: "1st forum", kind: "mongolia" }, { start: 2029, end: 2030, text: "2nd forum", kind: "mongolia" }] },
    { label: "ITU Cyberdrill · FIRST · APCERT", bars: [{ start: 2027, end: 2031, text: "joint participation every year", kind: "joint" }] },
  ],

  asks: [
    ["Include the expansion of the Cyber Security Training Centre project (Phase II) in the agenda and minutes of the 14th Joint Working Group", ""],
    ["Confirm instructor deployment to 2029 and approve a 2027–2029 joint training plan", "on the model of the 2024–2026 plan, with a train-the-trainer track for Mongolian faculty."],
    ["Agree a Phase II laboratory project – Cyber Range and SOC laboratory", "with a C-DAC / Defence Cyber Agency technical assessment in 2027."],
    ["Open seats for Mongolian faculty at Indian defence universities and research institutions from 2027", "and start the design of joint and double-degree programmes."],
    ["Hold the first Mongolia–India Cyber Security Forum in 2027", "and take part together in ITU Cyberdrill, FIRST and APCERT exercises."],
  ],
};
