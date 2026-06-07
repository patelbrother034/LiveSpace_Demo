const fs = require('fs');
const path = require('path');

const targetDir = 'd:\\PG-Demo\\src\\mock-data';

// 20 realistic Indian names (mix of students and professionals)
const firstNames = [
  "Aditya", "Rohan", "Vikram", "Nikhil", "Karan", "Suresh", "Amit", "Deepak", "Rahul", "Prateek",
  "Sanjay", "Vikas", "Rajat", "Manish", "Ankit", "Harish", "Pankaj", "Ashish", "Jatin", "Vijay"
];
const lastNames = [
  "Patel", "Sharma", "Mehta", "Joshi", "Gupta", "Nair", "Tiwari", "Yadav", "Verma", "Saxena",
  "Mishra", "Pandey", "Soni", "Dubey", "Chauhan", "Rao", "Jha", "Kothari", "Bansal", "Kapoor"
];

// Mapping of tenantId to bed details from beds.json (first 20 occupied beds)
const bedMappings = [
  { tenantId: "tenant-001", bedId: "bed-001", roomId: "room-001", floorId: "flr-001", buildingId: "bld-001", propertyId: "prop-001", rent: 15000 },
  { tenantId: "tenant-002", bedId: "bed-002", roomId: "room-002", floorId: "flr-001", buildingId: "bld-001", propertyId: "prop-001", rent: 10000 },
  { tenantId: "tenant-003", bedId: "bed-003", roomId: "room-002", floorId: "flr-001", buildingId: "bld-001", propertyId: "prop-001", rent: 10000 },
  { tenantId: "tenant-004", bedId: "bed-004", roomId: "room-003", floorId: "flr-001", buildingId: "bld-001", propertyId: "prop-001", rent: 7500 },
  { tenantId: "tenant-005", bedId: "bed-005", roomId: "room-003", floorId: "flr-001", buildingId: "bld-001", propertyId: "prop-001", rent: 7500 },
  { tenantId: "tenant-006", bedId: "bed-007", roomId: "room-004", floorId: "flr-002", buildingId: "bld-001", propertyId: "prop-001", rent: 11000 },
  { tenantId: "tenant-007", bedId: "bed-008", roomId: "room-004", floorId: "flr-002", buildingId: "bld-001", propertyId: "prop-001", rent: 11000 },
  { tenantId: "tenant-008", bedId: "bed-009", roomId: "room-005", floorId: "flr-002", buildingId: "bld-001", propertyId: "prop-001", rent: 8000 },
  { tenantId: "tenant-009", bedId: "bed-010", roomId: "room-005", floorId: "flr-002", buildingId: "bld-001", propertyId: "prop-001", rent: 8000 },
  { tenantId: "tenant-010", bedId: "bed-011", roomId: "room-005", floorId: "flr-002", buildingId: "bld-001", propertyId: "prop-001", rent: 8000 },
  { tenantId: "tenant-011", bedId: "bed-013", roomId: "room-007", floorId: "flr-003", buildingId: "bld-002", propertyId: "prop-001", rent: 10500 },
  { tenantId: "tenant-012", bedId: "bed-014", roomId: "room-007", floorId: "flr-003", buildingId: "bld-002", propertyId: "prop-001", rent: 10500 },
  { tenantId: "tenant-013", bedId: "bed-015", roomId: "room-008", floorId: "flr-003", buildingId: "bld-002", propertyId: "prop-001", rent: 7000 },
  { tenantId: "tenant-014", bedId: "bed-018", roomId: "room-009", floorId: "flr-003", buildingId: "bld-002", propertyId: "prop-001", rent: 7500 },
  { tenantId: "tenant-015", bedId: "bed-019", roomId: "room-009", floorId: "flr-003", buildingId: "bld-002", propertyId: "prop-001", rent: 7500 },
  { tenantId: "tenant-016", bedId: "bed-020", roomId: "room-009", floorId: "flr-003", buildingId: "bld-002", propertyId: "prop-001", rent: 7500 },
  { tenantId: "tenant-017", bedId: "bed-021", roomId: "room-010", floorId: "flr-004", buildingId: "bld-002", propertyId: "prop-001", rent: 11000 },
  { tenantId: "tenant-018", bedId: "bed-023", roomId: "room-011", floorId: "flr-004", buildingId: "bld-002", propertyId: "prop-001", rent: 7000 },
  { tenantId: "tenant-019", bedId: "bed-024", roomId: "room-011", floorId: "flr-004", buildingId: "bld-002", propertyId: "prop-001", rent: 7000 },
  { tenantId: "tenant-020", bedId: "bed-025", roomId: "room-011", floorId: "flr-004", buildingId: "bld-002", propertyId: "prop-001", rent: 7000 }
];

const cities = ["Noida", "Bangalore", "Gurgaon", "Pune", "Mumbai", "Delhi", "Hyderabad", "Chennai"];
const states = ["Uttar Pradesh", "Karnataka", "Haryana", "Maharashtra", "Maharashtra", "Delhi", "Telangana", "Tamil Nadu"];
const colleges = ["IIT Delhi", "BITS Pilani", "MIT Pune", "RV College of Engineering", "Amity University", "Symbiosis Pune"];
const companies = ["TCS", "Infosys", "Wipro", "Accenture", "Google", "Amazon", "Cognizant", "Swiggy"];

// 1. Generate tenants.json
const tenants = bedMappings.map((mapping, idx) => {
  const firstName = firstNames[idx % firstNames.length];
  const lastName = lastNames[idx % lastNames.length];
  const fullName = `${firstName} ${lastName}`;
  const isStudent = idx % 3 === 0;
  
  const paymentStatus = idx % 8 === 0 ? "Overdue" : idx % 5 === 0 ? "Pending" : idx % 10 === 0 ? "Partial" : "Paid";
  const tenantStatus = idx % 9 === 0 ? "Notice" : "Active";
  
  const daysPaid = 4; // Assume they paid 4 months of rent
  const totalPaid = mapping.rent * daysPaid;
  const pendingDues = paymentStatus === "Overdue" ? mapping.rent : paymentStatus === "Partial" ? Math.round(mapping.rent / 2) : 0;

  return {
    id: mapping.tenantId,
    orgId: "org-001",
    propertyId: mapping.propertyId,
    buildingId: mapping.buildingId,
    floorId: mapping.floorId,
    roomId: mapping.roomId,
    bedId: mapping.bedId,
    firstName: firstName,
    lastName: lastName,
    fullName: fullName,
    gender: "Male", // match Male PG (Royal Heights)
    dateOfBirth: `1999-0${(idx % 9) + 1}-${(idx * 7 % 28) + 1}`,
    phone: `+91-98765430${idx + 10}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@demo.com`,
    occupation: isStudent ? "Student" : "Professional",
    collegeName: isStudent ? colleges[idx % colleges.length] : undefined,
    companyName: isStudent ? undefined : companies[idx % companies.length],
    permanentAddress: {
      street: `Flat ${idx + 101}, Park View Apartments`,
      city: cities[idx % cities.length],
      state: states[idx % states.length],
      pin: `4000${idx + 10}`
    },
    aadhaarNumber: `1234567890${idx + 10}`,
    panNumber: `ABCDE${idx + 1000}F`,
    kycStatus: "Verified",
    kycDocuments: [
      { type: "Aadhaar", status: "Verified", fileUrl: `kyc/aadhaar_${mapping.tenantId}.pdf` }
    ],
    emergencyContact: {
      name: `${lastName} Parent`,
      relation: "Father",
      phone: `+91-99887766${idx + 10}`
    },
    monthlyRent: mapping.rent,
    securityDeposit: mapping.rent * 2,
    depositPaid: true,
    rentDueDate: 5,
    leaseStartDate: "2026-01-01",
    leaseEndDate: "2026-12-31",
    checkInDate: "2026-01-01",
    checkOutDate: null,
    status: tenantStatus,
    paymentStatus: paymentStatus,
    totalPaid: totalPaid,
    pendingDues: pendingDues,
    createdAt: "2026-01-01"
  };
});

fs.writeFileSync(path.join(targetDir, 'tenants.json'), JSON.stringify(tenants, null, 2));
console.log('Generated tenants.json');

// 2. Generate transactions.json
const transactions = [];
let txIdCounter = 1;

// Loop over all tenants to create their payment histories
tenants.forEach((tenant) => {
  // First, security deposit
  transactions.push({
    id: `tx-${txIdCounter++}`,
    orgId: "org-001",
    propertyId: tenant.propertyId,
    tenantId: tenant.id,
    type: "DEPOSIT",
    amount: tenant.securityDeposit,
    paymentMode: "UPI",
    paymentDate: "2026-01-01",
    description: "Security Deposit Payment",
    status: "Paid",
    createdAt: "2026-01-01"
  });

  // Rent for Jan, Feb, Mar, Apr, May
  const months = ["01", "02", "03", "04", "05"];
  months.forEach((m, idx) => {
    let status = "Paid";
    let amount = tenant.monthlyRent;
    if (m === "05") {
      status = tenant.paymentStatus;
      if (status === "Partial") {
        amount = Math.round(tenant.monthlyRent / 2);
      } else if (status === "Overdue" || status === "Pending") {
        status = "Pending"; // in transactions, pending means overdue/due
      }
    }

    if (status !== "Pending" || idx < 4) {
      transactions.push({
        id: `tx-${txIdCounter++}`,
        orgId: "org-001",
        propertyId: tenant.propertyId,
        tenantId: tenant.id,
        type: "RENT",
        amount: amount,
        paymentMode: idx % 3 === 0 ? "BankTransfer" : idx % 2 === 0 ? "UPI" : "Cash",
        paymentDate: `2026-${m}-04`,
        dueDate: `2026-${m}-05`,
        description: `Rent payment for ${m}/2026`,
        status: status === "Overdue" ? "Pending" : status,
        createdAt: `2026-${m}-04`
      });
    }
  });
});

// Add some expenses for the owner
for (let i = 1; i <= 10; i++) {
  transactions.push({
    id: `tx-exp-${i}`,
    orgId: "org-001",
    propertyId: "prop-001",
    tenantId: "",
    type: "EXPENSE",
    amount: 1500 * i,
    paymentMode: "Cash",
    paymentDate: `2026-05-${10 + i}`,
    description: `Property maintenance expense ${i}`,
    status: "Paid",
    createdAt: `2026-05-${10 + i}`
  });
}

fs.writeFileSync(path.join(targetDir, 'transactions.json'), JSON.stringify(transactions, null, 2));
console.log('Generated transactions.json');

// 3. Generate tickets.json
const tickets = [];
const ticketCategories = ["Plumbing", "Electrical", "Furniture", "Cleaning", "AC/Heating"];
const priorities = ["Low", "Medium", "High"];
const ticketStatuses = ["Open", "Assigned", "InProgress", "Resolved", "Closed"];

for (let i = 1; i <= 15; i++) {
  const tenant = tenants[i % tenants.length];
  const priority = priorities[i % priorities.length];
  const status = ticketStatuses[i % ticketStatuses.length];
  
  tickets.push({
    id: `ticket-${100 + i}`,
    orgId: "org-001",
    propertyId: tenant.propertyId,
    buildingId: tenant.buildingId,
    floorId: tenant.floorId,
    roomId: tenant.roomId,
    bedId: tenant.bedId,
    category: ticketCategories[i % ticketCategories.length],
    priority: priority,
    title: `${ticketCategories[i % ticketCategories.length]} issue in Room ${tenant.roomId}`,
    description: `Reported issue related to ${ticketCategories[i % ticketCategories.length].toLowerCase()} by resident. Please fix as soon as possible.`,
    reportedBy: tenant.id,
    reportedByName: tenant.fullName,
    assignedTo: i % 2 === 0 ? "staff-001" : undefined,
    assignedToName: i % 2 === 0 ? "Suresh Caretaker" : undefined,
    status: status,
    photos: [],
    timeline: [
      { status: "Open", notes: "Ticket raised by resident", timestamp: "2026-05-20T10:00:00Z" }
    ],
    createdAt: "2026-05-20T10:00:00Z"
  });
}

fs.writeFileSync(path.join(targetDir, 'tickets.json'), JSON.stringify(tickets, null, 2));
console.log('Generated tickets.json');
