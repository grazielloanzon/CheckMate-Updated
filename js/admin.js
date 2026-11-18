/**
 * CheckMate - Admin Portal Script
 * Merged pages: admin.html
 */


/* ==========================================================================
   CHECKMATE - REGISTERED DEMONSTRATION CITIZEN ACCOUNTS
   ========================================================================== */

const CM_ADMIN_DEFAULT_ACCOUNTS = [
    {
        id: 1,
        firstName: 'Vance Andri',
        surname: 'Rosaceña',
        email: 'vanceanrirosacena@gmail.com'
    },
    {
        id: 2,
        firstName: 'Marian Nicole',
        surname: 'Calising',
        email: 'sacayanmarian@gmail.com'
    },
    {
        id: 3,
        firstName: 'Shaynna kaye',
        surname: 'Cachila',
        email: 'shaynnakayec@gmail.com'
    },
    {
        id: 4,
        firstName: 'Sunshine',
        surname: 'Avenido',
        email: 'sunshinecahilaavenido@gmail.com'
    },
    {
        id: 5,
        firstName: 'Victor',
        surname: 'Asuncion',
        email: 'asuncionvictor@gmail.com'
    },
    {
        id: 6,
        firstName: 'Maria',
        surname: 'Santos',
        email: 'mariasantos@gmail.com'
    },
    {
        id: 7,
        firstName: 'James',
        surname: 'Cruz',
        email: 'jamescruz@gmail.com'
    },
    {
        id: 8,
        firstName: 'John',
        surname: 'Smith',
        email: 'johnsmith@gmail.com'
    },
    {
        id: 9,
        firstName: 'Angela',
        surname: 'Reyes',
        email: 'angelareyes@gmail.com'
    },
    {
        id: 10,
        firstName: 'Michael',
        surname: 'Garcia',
        email: 'michaelgarcia@gmail.com'
    },
    {
        id: 11,
        firstName: 'Sophia',
        surname: 'Lopez',
        email: 'sophialopez@gmail.com'
    },
    {
        id: 12,
        firstName: 'Daniel',
        surname: 'Flores',
        email: 'danielflores@gmail.com'
    },
    {
        id: 13,
        firstName: 'Andrea',
        surname: 'Ramos',
        email: 'andrearamos@gmail.com'
    },
    {
        id: 14,
        firstName: 'Nicole',
        surname: 'Hernandez',
        email: 'nicolehernandez@gmail.com'
    },
    {
        id: 15,
        firstName: 'Daren',
        surname: 'Abadiano',
        email: 'abadianodaren56@gmail.com'
    },
    {
        id: 16,
        firstName: 'John Michael',
        surname: 'Reyes',
        email: 'john.reyes12@gmail.com'
    },
    {
        id: 17,
        firstName: 'Angela',
        surname: 'Sinfuego',
        email: 'angelasinfuego29@gmail.com'
    },
    {
        id: 18,
        firstName: 'Princess Diane',
        surname: 'Doroin',
        email: 'dianedoroin030626@gmail.com'
    },
    {
        id: 19,
        firstName: 'Samantha',
        surname: 'Lopez',
        email: 'samantha.lopez@gmail.com'
    },
    {
        id: 20,
        firstName: 'Daniel',
        surname: 'Mendoza',
        email: 'daniel.mendoza6@gmail.com'
    },
    {
        id: 21,
        firstName: 'Chryzle',
        surname: 'Baal',
        email: 'baalchryzle@gmail.com'
    },
    {
        id: 22,
        firstName: 'Mark Anthony',
        surname: 'Dela Cruz',
        email: 'markdelacruz20@gmail.com'
    },
    {
        id: 23,
        firstName: 'Jia',
        surname: 'Paderan',
        email: 'jiapaderan01@gmail.com'
    },
    {
        id: 24,
        firstName: 'Gabriel',
        surname: 'Torres',
        email: 'gabriel.torres6@gmail.com'
    },
    {
        id: 25,
        firstName: 'Annica',
        surname: 'Oronan',
        email: 'annicaoronan21@gmail.com'
    },
    {
        id: 26,
        firstName: 'Christian',
        surname: 'Bautista',
        email: 'christianbautista@gmail.com'
    },
    {
        id: 27,
        firstName: 'Patricia Anne',
        surname: 'Villanueva',
        email: 'patriciavillanueva125@gmail.com'
    },
    {
        id: 28,
        firstName: 'Kevin Joseph',
        surname: 'Aquino',
        email: 'kevinaquino@gmail.com'
    },
    {
        id: 29,
        firstName: 'Isabelle Marie',
        surname: 'Castillo',
        email: 'Gehleepretty@gmail.com'
    }
];

function initializeDefaultAccounts() {
    const USERS_KEY = 'checkmate_users';
    const DEFAULT_PASSWORD = 'asdasd123';

    let users = [];

    try {
        users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

        if (!Array.isArray(users)) {
            users = [];
        }
    } catch (error) {
        users = [];
    }

    CM_ADMIN_DEFAULT_ACCOUNTS.forEach(account => {
        const existingUser = users.find(user =>
            (user.email || '').toLowerCase() === account.email.toLowerCase()
        );

        if (!existingUser) {
            users.push({
                id: Math.max(0, ...users.map(user => Number(user.id) || 0)) + 1,
                name: `${account.firstName} ${account.surname}`,
                firstName: account.firstName,
                surname: account.surname,
                email: account.email,
                password: DEFAULT_PASSWORD,
                role: 'Citizen',
                joined: new Date().toISOString().split('T')[0]
            });
        }
    });

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}


document.addEventListener('DOMContentLoaded', () => {
    initializeSharedData();

    // Automatically complete expired events
    updateExpiredEvents();

    // Check every 30 seconds while the page is open
    setInterval(() => {
        if (updateExpiredEvents()) {
            refreshAdminAfterAutoCompletion();
        }
    }, 30000);

    // Check again when the admin returns to the page
    window.addEventListener('focus', () => {
        if (updateExpiredEvents()) {
            refreshAdminAfterAutoCompletion();
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && updateExpiredEvents()) {
            refreshAdminAfterAutoCompletion();
        }
    });

    if (window.location.pathname.includes('admin.html')) {
        initMergedAdminPortal();
    } else {
        initLegacyAdminPortal(window.location.pathname);
    }

    setupGlobalNavigation();
    setupCreateEventForm();
    setupAdminNotifications();
});




/*-------(CUSTOM POPUP SYSTEM)-------*/

function showAdminToast(message, type = 'success', title = '') {
    let container = document.querySelector('.cm-toast-container');

    if (!container) {
        container = document.createElement('div');
        container.className = 'cm-toast-container';
        document.body.appendChild(container);
    }

    const settings = {
        success: { icon: 'bx-check-circle', title: title || 'Success' },
        error: { icon: 'bx-x-circle', title: title || 'Something went wrong' },
        warning: { icon: 'bx-error-circle', title: title || 'Warning' },
        info: { icon: 'bx-info-circle', title: title || 'Information' }
    };

    const config = settings[type] || settings.info;
    const toast = document.createElement('div');

    toast.className = `cm-toast ${type}`;

    toast.innerHTML = `
        <i class="bx ${config.icon} cm-toast-icon"></i>
        <div class="cm-toast-content">
            <strong>${escapeHTML(config.title)}</strong>
            <p>${escapeHTML(message)}</p>
        </div>
        <button type="button" class="cm-toast-close"
                aria-label="Close notification">&times;</button>
    `;

    container.appendChild(toast);

    let removed = false;

    function removeToast() {
        if (removed) return;
        removed = true;
        toast.classList.add('cm-toast-out');
        setTimeout(() => toast.remove(), 250);
    }

    toast.querySelector('.cm-toast-close')
        .addEventListener('click', removeToast);

    setTimeout(removeToast, 4000);
}

function showAdminConfirm({
    title = 'Are you sure?',
    message = 'Do you want to continue?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info'
} = {}) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'cm-confirm-overlay';

        const iconClass = type === 'danger'
            ? 'danger'
            : type === 'success' ? 'success' : '';

        const iconName = type === 'danger'
            ? 'bx-trash'
            : type === 'success' ? 'bx-check' : 'bx-help-circle';

        overlay.innerHTML = `
            <div class="cm-confirm-box" role="dialog"
                 aria-modal="true" aria-labelledby="cmConfirmTitle">
                <div class="cm-confirm-icon ${iconClass}">
                    <i class="bx ${iconName}"></i>
                </div>
                <h3 id="cmConfirmTitle">${escapeHTML(title)}</h3>
                <p>${escapeHTML(message)}</p>
                <div class="cm-confirm-actions">
                    <button type="button" class="cm-confirm-cancel">
                        ${escapeHTML(cancelText)}
                    </button>
                    <button type="button"
                            class="cm-confirm-accept ${type === 'danger' ? 'danger' : ''}">
                        ${escapeHTML(confirmText)}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        function finish(result) {
            document.removeEventListener('keydown', handleEscape);
            overlay.remove();
            resolve(result);
        }

        function handleEscape(e) {
            if (e.key === 'Escape') finish(false);
        }

        overlay.querySelector('.cm-confirm-cancel')
            .addEventListener('click', () => finish(false));

        overlay.querySelector('.cm-confirm-accept')
            .addEventListener('click', () => finish(true));

        overlay.addEventListener('click', e => {
            if (e.target === overlay) finish(false);
        });

        document.addEventListener('keydown', handleEscape);

        overlay.querySelector('.cm-confirm-cancel').focus();
    });
}



/* ==========================================================================
   INITIALIZATION & SEED DATA
   ========================================================================== */

function initializeSharedData() {
    const SEED_VERSION = '1';

    const communityEvents = [
        {
            id: 1001,
            title: "Free Legal Assistance",
            date: "2026-07-31",
            startTime: "10:00",
            endTime: "12:00",
            location: "Barangay San Dionisio Session Hall",
            category: "Public Service",
            status: "completed",
            description: "A free legal assistance program provided to residents of Barangay San Dionisio who need legal advice and assistance.",
            requirements: "Appointment at the Barangay Secretary's Office. Walk-ins are not accepted. Only the first five clients will be accommodated."
        },
        {
            id: 1002,
            title: "Project Tagumpay – Free Civil Service Exam Review Program",
            date: "2026-07-11",
            startTime: "10:00",
            endTime: "15:00",
            location: "Barangay San Dionisio Session Hall",
            category: "Education",
            status: "completed",
            description: "A free review program designed to help residents prepare for the Civil Service Examination (CSE) for Professional.",
            requirements: "Registration through the provided QR code."
        },
        {
            id: 1003,
            title: "CHED Tulong Dunong Scholarship Program",
            date: "2026-08-14",
            startTime: "09:00",
            endTime: "15:00",
            location: "Office of the Barangay Secretary",
            category: "Education",
            status: "completed",
            description: "A scholarship opportunity offering 70 slots for incoming first-year to fourth-year college students who are residents of Barangay San Dionisio.",
            requirements: `Must be a resident of Barangay San Dionisio.
Updated voter's certification as of 2026.
Accomplished application form.
Two pieces of 2x2 ID pictures.
Certified true copy of Certificate of Enrollment or Registration with subjects and units indicated for SY 2026–2027.
Barangay indigency certificate for CHED requirements.
Photocopy of School ID or National ID.
One set of original documents and one set of photocopies.`
        },
        {
            id: 1004,
            title: "TESDA Orientation for Shielded Metal Arc Welding NC I and NC II",
            date: "2026-11-28",
            startTime: "09:00",
            endTime: "15:00",
            location: "New Barangay Hall Session Hall",
            category: "Education",
            status: "upcoming",
            description: "An orientation program for residents interested in TESDA training for Shielded Metal Arc Welding NC I and NC II.",
            requirements: `SRA Enrollment Form.
Photocopy of Diploma.
Photocopy of Birth Certificate.
Photocopy of TOR/Form 137/SF10.
Valid ID with three specimen signatures.
Three 1x1 ID pictures.
Three 2x2 ID pictures.
Two passport-size ID pictures with formal attire, white background, and name tag.`
        },
        {
            id: 1005,
            title: "Free Zumba",
            date: "2026-12-03",
            startTime: "07:00",
            endTime: "08:00",
            location: "Barangay San Dionisio Old Gym",
            category: "Sports",
            status: "upcoming",
            description: "A free Zumba activity encouraging residents to exercise, stay active, and maintain a healthy lifestyle.",
            requirements: "No specific requirements mentioned."
        },
        {
            id: 1006,
            title: "Free Pneumococcal Vaccine for Senior Citizens",
            date: "2026-08-27",
            startTime: "13:00",
            endTime: "15:00",
            location: "San Dionisio Health Center",
            category: "Health",
            status: "completed",
            description: "A free pneumococcal vaccination program for senior citizens of Barangay San Dionisio to help protect them against pneumococcal diseases.",
            requirements: `OSCA ID (white card), not OSCA CARES ID or HELP card.
YAKAP ID, PhilHealth ID, or PhilHealth number.
Previous vaccination card for those vaccinated five years ago.
eGovPH App on mobile phone.`
        },
        {
            id: 1007,
            title: "Trabaho Caravan Mini-Job Fair",
            date: "2026-12-08",
            startTime: "08:00",
            endTime: "15:00",
            location: "88 Square Mall",
            category: "Public Service",
            status: "upcoming",
            description: "A job fair organized by PESO in coordination with Barangay San Dionisio to provide employment opportunities and help residents find jobs.",
            requirements: "Specific requirements are not shown in the provided information. Applicants should prepare their resumes and identification documents."
        },
        {
            id: 1008,
            title: "Mind Matters: Empowering the Youth",
            date: "2026-12-15",
            startTime: "08:00",
            endTime: "12:00",
            location: "Barangay San Dionisio Old Gym",
            category: "Health",
            status: "upcoming",
            description: "A free mental health seminar sponsored by Congressman Eric L. Olivarez. It aims to promote mental health awareness and encourage young people to speak about their feelings and experiences.",
            requirements: "Open to youth ages 15–30 from all barangays in District 1. Free registration through the provided link."
        },
        {
            id: 1009,
            title: "Health and Wellness Awareness for Senior Citizens and PWDs",
            date: "2026-12-10",
            startTime: "08:00",
            endTime: "12:00",
            location: "Barangay San Dionisio Old Gymnasium",
            category: "Health",
            status: "upcoming",
            description: "A health and wellness awareness program offering PhilHealth YAKAP profiling for 100 persons with disabilities and 100 senior citizens.",
            requirements: "Registration at the Social Services Office. Look for Mrs. Miramis Mijares."
        },
        {
            id: 1010,
            title: "Zumbarangay",
            date: "2026-12-15",
            startTime: "08:00",
            endTime: "10:00",
            location: "Barangay San Dionisio Old Gymnasium",
            category: "Sports",
            status: "upcoming",
            description: "A community Zumba activity that encourages residents to exercise, dance, enjoy themselves, and promote a healthy lifestyle.",
            requirements: "Register at the Office of San Dionisio Old Gymnasium. Look for Mr. Michael Sta. Ana."
        },
        {
            id: 1011,
            title: "Health & Wellness Awareness",
            date: "2026-10-07",
            startTime: "08:00",
            endTime: "12:00",
            location: "Barangay San Dionisio Old Gymnasium",
            category: "Health",
            status: "completed",
            description: "Encourages healthy lifestyles, positive habits, and overall physical and mental well-being.",
            requirements: "None."
        },
        {
            id: 1012,
            title: "Mind Matters: Empowering The Youth",
            date: "2026-09-19",
            startTime: "08:00",
            endTime: "12:00",
            location: "Barangay San Dionisio Old Gymnasium",
            category: "Health",
            status: "completed",
            description: "Promotes youth mental health awareness, emotional well-being, and the importance of self-care and support.",
            requirements: "None."
        },
        {
            id: 1013,
            title: "Trabaho Caravan Mini-Job Fair",
            date: "2026-09-08",
            startTime: "08:00",
            endTime: "15:00",
            location: "88 Square Mall",
            category: "Public Service",
            status: "completed",
            description: "Provides job opportunities by connecting job seekers with employers and offering career support to help individuals find employment.",
            requirements: "Must be a resident of Barangay San Dionisio."
        },
        {
            id: 1014,
            title: "Free Zumba",
            date: "2026-09-19",
            startTime: "08:00",
            endTime: "12:00",
            location: "Barangay San Dionisio Old Gymnasium",
            category: "Health",
            status: "completed",
            description: "Encourages an active and healthy lifestyle through enjoyable dance workouts that promote fitness, wellness, and community engagement.",
            requirements: "None."
        },
        {
            id: 1015,
            title: "Libreng Pneumococcal Vaccine",
            date: "",
            schedule: "Monday–Friday (Except Holidays)",
            startTime: "13:00",
            endTime: "15:00",
            location: "San Dionisio Health Center",
            category: "Health",
            status: "completed",
            description: "Provides free pneumococcal vaccination to help protect individuals against pneumonia and other serious infections.",
            requirements: `OSCA ID (white card) — NOT OSCA CARES ID or HELP card.
YAKAP ID / PhilHealth Number.
Previous vaccination card for those who received the Pneumococcal Vaccine (Pneumovax) five years ago.
eGovPH App on your cellphone.`
        },
        {
            id: 1016,
            title: "TESDA Orientation",
            date: "2026-08-28",
            startTime: "08:00",
            endTime: "12:00",
            location: "New Barangay Hall Session Hall",
            category: "Education",
            status: "completed",
            description: "Provides information about TESDA programs, skills training, and certification opportunities to support career development and employment.",
            requirements: `SRAI Enrollment Form.
Photocopy of Diploma.
Photocopy of Birth Certificate.
Photocopy of TOR/Form 137/SF10.
Three 1x1 ID pictures.
Valid ID with three specimen signatures.
Three 2x2 ID pictures.
Two passport-size ID pictures (formal attire, white background, and name tag).`
        },
        {
            id: 1017,
            title: "CHED Tulong Dunong Program",
            date: "2026-12-19",
            startTime: "08:00",
            endTime: "12:00",
            location: "Office of Barangay Secretary",
            category: "Education",
            status: "upcoming",
            description: "Offers educational support and financial assistance to deserving students to help them continue their studies and pursue their dreams.",
            requirements: `Must be a resident of Barangay San Dionisio.
Updated Voter's Certification as of 2026.
Duly accomplished application form.
Two pieces of 2x2 ID pictures.
Certified true copy of Certificate of Enrollment (COE) or Certificate of Registration with subjects and units indicated, signed by the School Registrar for SY 2026–2027.
Barangay Indigency with the purpose: CHED Requirements.
Photocopy of School ID or National ID.
Submit one set of original documents and one set of photocopies.`
        },
        {
            id: 1018,
            title: "Free Legal Assistance",
            date: "2026-11-30",
            startTime: "10:00",
            endTime: "12:00",
            location: "Barangay San Dionisio Session Hall",
            category: "Public Service",
            status: "upcoming",
            description: "Provides free legal advice and guidance to help individuals understand their rights and access justice.",
            requirements: "Walk-ins will not be accepted. Only the first five clients will be accommodated."
        },
        {
            id: 1019,
            title: "PROJECT TAGUMPAY: Serbisyo Para sa Bayan",
            date: "2026-12-01",
            startTime: "08:00",
            endTime: "17:00",
            location: "Barangay San Dionisio Old Gymnasium",
            category: "Public Service",
            status: "upcoming",
            description: "Provides essential community services and assistance to promote public welfare and improve the quality of life of residents.",
            requirements: "No specific requirements provided."
        },
        {
            id: 1020,
            title: "Barangay Clean-Up Drive",
            date: "2026-12-12",
            startTime: "06:00",
            endTime: "10:00",
            location: "Different areas of Barangay San Dionisio",
            category: "Environment",
            status: "upcoming",
            description: "Residents are encouraged to participate in cleaning streets, collecting garbage, and maintaining a clean community.",
            requirements: `Registration form.
Gloves.
Face mask.
Cleaning materials (broom, dustpan, garbage bags).`
        },
        {
            id: 1021,
            title: "Green San Dionisio: Tree Planting Activity",
            date: "2027-01-09",
            startTime: "07:00",
            endTime: "11:00",
            location: "Barangay San Dionisio",
            category: "Environment",
            status: "upcoming",
            description: "A community activity that encourages residents to plant trees and help protect the environment.",
            requirements: `Registration form.
Gardening gloves.
Water bottle.
Hat or cap.
Gardening tools (if available).`
        },
        {
            id: 1022,
            title: "Christmas Gift-Giving Program",
            date: "2026-12-19",
            startTime: "09:00",
            endTime: "12:00",
            location: "Barangay San Dionisio Covered Court",
            category: "Community",
            status: "upcoming",
            description: "A gift-giving activity that aims to share happiness and provide gifts to children and families in need.",
            requirements: `Registration form.
Barangay ID or valid ID.
Proof of residency.`
        },
        {
            id: 1023,
            title: "Buwan ng Sining at Kultura",
            date: "2026-12-05",
            startTime: "08:00",
            endTime: "17:00",
            location: "Barangay San Dionisio Old Gymnasium",
            category: "Culture",
            status: "upcoming",
            description: "A celebration showcasing Filipino culture through traditional dances, music, arts, and local performances.",
            requirements: `Registration form.
Valid ID.
Traditional or cultural attire (optional).`
        },
        {
            id: 1024,
            title: "Larong Pinoy: Traditional Games Festival",
            date: "2027-01-16",
            startTime: "13:00",
            endTime: "17:00",
            location: "Barangay San Dionisio Sports Complex",
            category: "Culture",
            status: "upcoming",
            description: "A fun event where residents can enjoy traditional Filipino games such as patintero, piko, tumbang preso, and luksong tinik.",
            requirements: `Registration form.
Valid ID.
Comfortable clothes.
Parental consent for minors.`
        },
        {
            id: 1025,
            title: "Alagang San Dionisio: Health, Wellness, and Dengue Prevention Caravan",
            date: "2026-12-05",
            startTime: "08:00",
            endTime: "12:00",
            location: "San Dionisio Barangay Hall / Covered Court",
            category: "Health",
            status: "upcoming",
            description: "Free basic health screening, blood-pressure and blood-sugar checks, nutrition guidance, dengue-prevention education, and distribution of health information materials for families and senior citizens.",
            requirements: "Barangay health workers, nurses or volunteer medical personnel, blood-pressure monitors, glucometers, registration desks, chairs, tents, drinking water, and information flyers."
        },
        {
            id: 1026,
            title: "Libreng Anti-Rabies Vaccination & Pet Microchipping Drive",
            date: "2026-09-28",
            startTime: "08:00",
            endTime: "12:00",
            location: "Barangay San Dionisio Hall Grounds, Parañaque City",
            category: "Public Service",
            status: "completed",
            description: "Held in observance of World Rabies Day in coordination with the Parañaque City Veterinary Services Office, providing free anti-rabies shots, deworming, and pet registration for resident dogs and cats.",
            requirements: "Barangay residency ID. Pets must be at least 3 months old, healthy, and securely leashed or placed inside a pet carrier."
        },
        {
            id: 1027,
            title: "Community Disaster Preparedness & Earthquake/Fire Drill",
            date: "2026-07-18",
            startTime: "08:00",
            endTime: "12:00",
            location: "Barangay San Dionisio Evacuation Center & Multi-Purpose Hall, Parañaque City",
            category: "Education",
            status: "completed",
            description: "Conducted during National Disaster Resilience Month by the Barangay Disaster Risk Reduction and Management Committee (BDRRMC), training residents, barangay tanod, and household representatives in basic first aid, fire extinguisher use, and evacuation protocols.",
            requirements: "Prior registration at the Barangay Hall. Participants should wear comfortable clothing and closed shoes."
        },
        {
            id: 1028,
            title: "Sunduan sa San Dionisio (Traditional Courtship & Fiesta Procession)",
            date: "2026-04-05",
            startTime: "04:00",
            endTime: "07:00",
            location: "Cathedral and Parish of St. Andrew (Parañaque Cathedral) & Barangay San Dionisio Streets, Parañaque City",
            category: "Culture",
            status: "completed",
            description: "A centuries-old Parañaque Easter tradition where a 22- to 24-member dance troupe representing Barangay San Dionisio performs the Sayaw ng Pagbati, waving 60-centimeter flower-adorned flaglets in elaborate formal attire, to welcome the meeting of the statues of the Resurrected Christ and the Virgin Mary.",
            requirements: "Open to the public for viewing. Troupe performers are selected and trained by the barangay's cultural committee."
        },
        {
            id: 1029,
            title: "Sayaw ng Pagbati (Easter Sunday Dawn Ritual Dance)",
            date: "2026-04-05",
            startTime: "04:00",
            endTime: "07:00",
            location: "Cathedral and Parish of St. Andrew (Parañaque Cathedral) & Barangay San Dionisio Streets, Parañaque City",
            category: "Culture",
            status: "completed",
            description: "A centuries-old Parañaque Easter tradition where a 22- to 24-member dance troupe representing Barangay San Dionisio performs the Sayaw ng Pagbati, waving 60-centimeter flower-adorned flaglets in elaborate formal attire, to welcome the meeting of the statues of the Resurrected Christ and the Virgin Mary.",
            requirements: "Open to the public for viewing. Troupe performers are selected and trained by the barangay's cultural committee."
        },
        {
            id: 1030,
            title: "Barangay San Dionisio Senior Citizens' Medical & Eye Check-Up Mission",
            date: "2026-10-03",
            startTime: "07:30",
            endTime: "12:00",
            location: "Barangay San Dionisio Covered Court, Parañaque City",
            category: "Health",
            status: "completed",
            description: "A specialized health outreach organized by the Barangay San Dionisio Office for Senior Citizens Affairs (OSCA) chapter in partnership with Parañaque City Health Office, offering free blood pressure and blood sugar screening, cataract/vision exams, reading glasses distribution, and flu/pneumonia vaccinations.",
            requirements: "Parañaque OSCA Senior Citizen ID and Barangay San Dionisio residency verification."
        }
    ];

    // Load existing events without deleting user-created events.
    let storedEvents = [];

    try {
        storedEvents = JSON.parse(
            localStorage.getItem('checkmate_events') || '[]'
        );

        if (!Array.isArray(storedEvents)) {
            storedEvents = [];
        }
    } catch (error) {
        console.error("Could not read saved events:", error);
        storedEvents = [];
    }

    // Import the community events only once per seed version.
    if (localStorage.getItem('checkmate_events_seed_version') !== SEED_VERSION) {

        // Remove the three old sample records from the original admin.js.
        const oldSampleTitles = [
            "Barangay Clean-up Drive",
            "Free Health & Dental Checkup",
            "Youth Basketball Tournament"
        ];

        storedEvents = storedEvents.filter(event => {
            const isOldSample =
                [1, 2, 3].includes(Number(event.id)) &&
                oldSampleTitles.includes(event.title);

            return !isOldSample;
        });

        communityEvents.forEach(event => {
            const alreadyExists = storedEvents.some(existing =>
                existing.id === event.id ||
                existing.sourceId === `community-${event.id}`
            );

            if (!alreadyExists) {
                storedEvents.push({
                    ...event,
                    source: 'preloaded',
                    sourceId: `community-${event.id}`
                });
            }
        });

        localStorage.setItem(
            'checkmate_events',
            JSON.stringify(storedEvents)
        );

        localStorage.setItem(
            'checkmate_events_seed_version',
            SEED_VERSION
        );
    }

    // Add categories to older event records if missing.
    const categoryDefaults = {
        1: 'Environment',
        2: 'Health',
        3: 'Sports'
    };

    let changed = false;

    storedEvents.forEach(event => {
        if (!event.category) {
            event.category = categoryDefaults[event.id] || 'Community';
            changed = true;
        }
    });

    if (changed) {
        localStorage.setItem(
            'checkmate_events',
            JSON.stringify(storedEvents)
        );
    }

    // Initialize registered demonstration accounts.
    initializeDefaultAccounts();
}


/*-------(AUTOMATIC EVENT STATUS UPDATES)-------*/

function updateExpiredEvents() {
    const events = JSON.parse(localStorage.getItem('checkmate_events')) || [];

    const now = new Date();
    let changed = false;

    events.forEach(event => {
        // Keep manually or previously completed events completed
        if (event.status === 'completed') return;

        // Skip events without a date or time
        if (!event.date || !event.startTime || !event.endTime) return;

        // Get the event's starting and ending date/time
        const startDateTime = new Date(
            `${event.date}T${event.startTime}:00`
        );

        const endDateTime = new Date(
            `${event.date}T${event.endTime}:00`
        );

        // Skip invalid dates
        if (
            isNaN(startDateTime.getTime()) ||
            isNaN(endDateTime.getTime())
        ) return;

        let newStatus;

        if (now >= endDateTime) {
            newStatus = 'completed';
        } else if (now >= startDateTime) {
            newStatus = 'ongoing';
        } else {
            newStatus = 'upcoming';
        }

        // Save only when the status actually changes
        if (event.status !== newStatus) {
            event.status = newStatus;
            changed = true;
        }
    });

    if (changed) {
        localStorage.setItem('checkmate_events', JSON.stringify(events));
    }

    return changed;
}


function refreshAdminAfterAutoCompletion() {
    if (window.location.pathname.includes('admin.html')) {
        const section = getAdminSectionFromHash();

        if (section === 'events') {
            loadAdminEventsTable();
        } else if (section === 'dashboard') {
            renderAdminDashboard();
        }
    } else if (window.location.pathname.includes('admin-manage-events.html')) {
        loadAdminEventsTable();
    } else if (window.location.pathname.includes('admin-dashboard.html')) {
        renderAdminDashboard();
    }
}


/* ==========================================================================
   MERGED ADMIN PAGE
   ========================================================================== */
function initMergedAdminPortal() {
    showAdminSection(getAdminSectionFromHash());

    window.addEventListener('hashchange', () => {
        showAdminSection(getAdminSectionFromHash());
    });

    // Live update: when a new user signs up (or events change) in another tab,
    // refresh the admin view without needing a page reload
    window.addEventListener('storage', e => {
        if (e.key !== 'checkmate_users' && e.key !== 'checkmate_events') return;

        const section = getAdminSectionFromHash();

        if (section === 'users') renderAdminUsers();
        if (section === 'dashboard') renderAdminDashboard();
        if (section === 'events') loadAdminEventsTable();
    });
}

function parseAdminHash() {
    const raw = window.location.hash.replace('#', '');
    const [name, query = ''] = raw.split('?');
    return { name, params: new URLSearchParams(query) };
}

function getAdminSectionFromHash() {
    const hash = parseAdminHash().name;

    if (hash === 'events') return 'events';
    if (hash === 'create-event') return 'create-event';
    if (hash === 'users') return 'users';

    return 'dashboard';
}

function showAdminSection(section) {
    document.querySelectorAll('.admin-section').forEach(el => {
        el.style.display = 'none';
    });

    document.querySelectorAll('.navbar-list li[data-section]').forEach(el => {
        el.classList.remove('active');
    });

    if (section === 'events') {
        document.getElementById('admin-events-section').style.display = 'block';
        document.querySelector('[data-section="events"]').classList.add('active');
        renderAdminManageEvents();
        return;
    }

    if (section === 'create-event') {
        document.getElementById('admin-create-section').style.display = 'block';
        document.querySelector('[data-section="events"]').classList.add('active');
        setupCreateEventForm();
        loadEventForEditing();
        return;
    }

    if (section === 'users') {
        document.getElementById('admin-users-section').style.display = 'block';
        document.querySelector('[data-section="users"]').classList.add('active');
        renderAdminUsers();
        return;
    }

    document.getElementById('admin-dashboard-section').style.display = 'block';
    document.querySelector('[data-section="dashboard"]').classList.add('active');
    renderAdminDashboard();
}


/* ==========================================================================
   DASHBOARD
   ========================================================================== */

function renderAdminDashboard() {
    let events = [];
    let users = [];

    try {
        events = JSON.parse(localStorage.getItem('checkmate_events')) || [];
        users = JSON.parse(localStorage.getItem('checkmate_users')) || [];

        if (!Array.isArray(events)) events = [];
        if (!Array.isArray(users)) users = [];
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }

    const contentPanel = document.querySelector('#dashboardPanel');
    if (!contentPanel) return;

    const upcomingEvents = events.filter(e => e.status === 'upcoming');
    const ongoingEvents = events.filter(e => e.status === 'ongoing');
    const completedEvents = events.filter(e => e.status === 'completed');

    const recentlyAdded = events
        .filter(event => event.createdAt)
        .sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        )
        .slice(0, 5);

    const formatDate = date => {
        if (!date) return 'Date not specified';

        const parsed = new Date(`${date}T00:00:00`);

        return isNaN(parsed.getTime())
            ? date
            : parsed.toLocaleDateString('en-PH', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
    };

    contentPanel.innerHTML = `

        <div class="row g-3 mb-4">

            <div class="col-md-6 col-xl-3">
                <div class="dashboard-stat-card">
                    <div class="dashboard-stat-icon blue">
                        <i class="bx bx-calendar-event"></i>
                    </div>
                    <div>
                        <h3>${events.length}</h3>
                        <p>Total Events</p>
                    </div>
                </div>
            </div>

            <div class="col-md-6 col-xl-3">
                <div class="dashboard-stat-card">
                    <div class="dashboard-stat-icon orange">
                        <i class="bx bx-arrow-out-up-circle-half"></i>
                    </div>
                    <div>
                        <h3>${upcomingEvents.length}</h3>
                        <p>Upcoming Events</p>
                    </div>
                </div>
            </div>

            <div class="col-md-6 col-xl-3">
                <div class="dashboard-stat-card">
                    <div class="dashboard-stat-icon green">
                        <i class="bx bx-play-circle"></i>
                    </div>
                    <div>
                        <h3>${ongoingEvents.length}</h3>
                        <p>Ongoing Events</p>
                    </div>
                </div>
            </div>

            <div class="col-md-6 col-xl-3">
                <div class="dashboard-stat-card">
                    <div class="dashboard-stat-icon purple">
                        <i class="bx bx-group"></i>
                    </div>
                    <div>
                        <h3>${users.length}</h3>
                        <p>Registered Users</p>
                    </div>
                </div>
            </div>

        </div>

        <div class="row g-4">

            <div class="col-12">
                <div class="dashboard-content-card h-100">
                    <div class="dashboard-card-heading">
                        <div>
                            <h4>Recently Added Events</h4>
                            <p>Latest events added to the community portal</p>
                        </div>
                        <i class="bx bx-calendar-plus"></i>
                    </div>

                    <div class="dashboard-recent-list">
                        ${recentlyAdded.length === 0
            ? `<p class="text-muted text-center py-4">
                                No events available yet.
                               </p>`
            : recentlyAdded.map(event => `
                                <div class="dashboard-recent-item">
                                    <div class="dashboard-event-icon">
                                        <i class="bx bx-calendar"></i>
                                    </div>

                                    <div class="dashboard-event-info">
                                        <strong title="${escapeHTML(event.title)}">
                                            ${escapeHTML(event.title || 'Untitled Event')}
                                        </strong>
                                        <small>
                                            ${escapeHTML(event.category || 'Community')}
                                            • ${escapeHTML(formatDate(event.date))}
                                        </small>
                                    </div>

                                    <span class="badge ${getStatusBadge(event.status)}">
                                        ${escapeHTML(event.status || 'Unknown')}
                                    </span>
                                </div>
                            `).join('')
        }
                    </div>

                    <a href="admin.html#events" class="dashboard-view-link">
                        View All Events <i class="bx bx-right-arrow-alt"></i>
                    </a>
                </div>
            </div>

        </div>
    `;
}



/* ==========================================================================
   MANAGE EVENTS
   ========================================================================== */
let adminStatusFilter = 'upcoming';
let adminSearchQuery = '';
let adminCategoryFilter = 'all';

function renderAdminManageEvents() {
    const contentPanel = document.querySelector('#eventsPanel');
    if (!contentPanel) return;

    adminSearchQuery = '';
    adminCategoryFilter = 'all';

    contentPanel.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2>Community Events</h2>
                <p>Manage all active, upcoming, and past community events.</p>
            </div>

            <a href="admin.html#create-event" class="btn btn-primary" id="btnOpenCreateEvent">
                <i class="bx bx-plus"></i> Create Event
            </a>
        </div>

        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <ul class="nav nav-pills" id="adminStatusTabs">
                <li class="nav-item">
                    <button type="button" class="nav-link" data-status="upcoming">Upcoming Events</button>
                </li>
                <li class="nav-item">
                    <button type="button" class="nav-link" data-status="ongoing">Ongoing Events</button>
                </li>
                <li class="nav-item">
                    <button type="button" class="nav-link" data-status="completed">Completed Events</button>
                </li>
            </ul>

            <div class="admin-search-group">
                <select class="form-select" id="adminCategoryFilter" aria-label="Filter by category">
                    <option value="all">All Categories</option>
                    <option value="Community">Community</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Environment">Environment</option>
                    <option value="Sports">Sports</option>
                    <option value="Culture">Culture</option>
                    <option value="Public Service">Public Service</option>
                </select>

                <div class="admin-search-field">
                    <i class="bx bx-search"></i>
                    <input type="search"
                           class="form-control"
                           id="adminSearchInput"
                           placeholder="Search title or category..."
                           aria-label="Search events"
                           autocomplete="off">
                </div>
            </div>
        </div>

        <div class="table-responsive manage-events-table-wrapper">
            <table class="table table-hover align-middle manage-events-table">
                    <colgroup>
                        <col style="width: 26%;">
                        <col style="width: 12%;">
                        <col style="width: 12%;">
                        <col style="width: 9%;">
                        <col style="width: 17%;">
                        <col style="width: 10%;">
                        <col style="width: 90px;">
                    </colgroup>
                <thead class="table-light">
                    <tr>
                        <th>Event Details</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th class="text-center">Actions</th>
                    </tr>
                </thead>

                <tbody id="adminEventsTableBody"></tbody>
            </table>
        </div>
    `;

    document.querySelectorAll('#adminStatusTabs .nav-link').forEach(btn => {
        btn.addEventListener('click', () => {
            adminStatusFilter = btn.dataset.status;
            updateAdminTabs();
            loadAdminEventsTable();
        });
    });

    document.getElementById('adminCategoryFilter').addEventListener('change', (e) => {
        adminCategoryFilter = e.target.value;
        loadAdminEventsTable();
    });

    document.getElementById('adminSearchInput').addEventListener('input', (e) => {
        adminSearchQuery = e.target.value;
        loadAdminEventsTable();
    });

    updateAdminTabs();
    loadAdminEventsTable();
}

function updateAdminTabs() {
    document.querySelectorAll('#adminStatusTabs .nav-link').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.status === adminStatusFilter);
    });
}


function loadAdminEventsTable() {
    const tbody = document.getElementById('adminEventsTableBody');
    if (!tbody) return;

    let allEvents = [];

    try {
        allEvents = JSON.parse(
            localStorage.getItem('checkmate_events')
        ) || [];

        if (!Array.isArray(allEvents)) {
            allEvents = [];
        }
    } catch (error) {
        console.error('Error loading events:', error);
        allEvents = [];
    }

    // Get events matching the selected status.
    let events = allEvents.filter(
        event => event.status === adminStatusFilter
    );

    // Category filter.
    if (adminCategoryFilter !== 'all') {
        events = events.filter(
            event => (event.category || 'Community') === adminCategoryFilter
        );
    }

    // Search filter.
    const query = adminSearchQuery.trim().toLowerCase();

    if (query !== '') {
        const words = query.split(/\s+/).filter(Boolean);

        events = events.filter(event => {
            const text =
                `${event.title || ''} ${event.category || ''}`.toLowerCase();

            return words.every(word => text.includes(word));
        });
    }

    // SORT EVENTS.
    events.sort((a, b) => {
        // Newly created events always appear before premade events.
        const createdA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;

        const createdB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;

        if (createdA !== createdB) {
            return createdB - createdA;
        }

        // Events without creation timestamps use their event dates.
        const dateA = a.date || '';
        const dateB = b.date || '';

        // Upcoming: nearest date first.
        if (adminStatusFilter === 'upcoming') {
            const dateCompare = dateA.localeCompare(dateB);

            if (dateCompare !== 0) return dateCompare;

            return (a.startTime || '').localeCompare(b.startTime || '');
        }

        // Ongoing and Completed: newest event date first.
        const dateCompare = dateB.localeCompare(dateA);

        if (dateCompare !== 0) return dateCompare;

        // If dates match, use the latest time first.
        return (b.startTime || '').localeCompare(a.startTime || '');
    });

    if (events.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-3">
                    ${
                        (query || adminCategoryFilter !== 'all')
                            ? 'No matching events found.'
                            : `No ${adminStatusFilter} events.`
                    }
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = events.map(event => `
        <tr>
            <td>
                <div class="fw-bold text-dark event-title-cell"
                    title="${escapeHTML(event.title)}">
                    ${escapeHTML(event.title)}
                </div>
            </td>

            <td>${escapeHTML(event.category || 'Community')}</td>
            <td>${escapeHTML(event.date || '—')}</td>
            <td>${escapeHTML(event.startTime || event.time || '—')}</td>

            <td class="location-cell"
                title="${escapeHTML(event.location || '—')}">
                ${escapeHTML(event.location || '—')}
            </td>

            <td>
                <span class="badge ${getStatusBadge(event.status)}">
                    ${escapeHTML(event.status)}
                </span>
            </td>

            <td class="actions-cell">
                <div class="dropdown">
                    <button type="button"
                        class="btn btn-light btn-sm action-dots"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        aria-label="Actions"
                        title="Actions">

                        <svg width="18" height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true">
                            <circle cx="12" cy="5" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="12" cy="19" r="2"/>
                        </svg>
                    </button>

                    <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                        ${event.status !== 'completed' ? `
                            <li>
                                <button type="button"
                                    class="dropdown-item text-success"
                                    onclick="markAsCompleted('${event.id}')">
                                    <i class="bx bx-check"></i> Mark as Done
                                </button>
                            </li>
                        ` : ''}

                        <li>
                            <button type="button"
                                class="dropdown-item text-primary"
                                onclick="editEvent('${event.id}')">
                                <i class="bx bx-edit"></i> Edit
                            </button>
                        </li>

                        <li>
                            <button type="button"
                                class="dropdown-item text-danger"
                                onclick="deleteEvent('${event.id}')">
                                <i class="bx bx-trash"></i> Delete
                            </button>
                        </li>
                    </ul>
                </div>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(btn => {
        new bootstrap.Dropdown(btn, {
            popperConfig: { strategy: 'fixed' }
        });
    });
}



/* ==========================================================================
   ADMIN ACTIONS
   ========================================================================== */

window.editEvent = function (id) {
    window.location.hash = `create-event?edit=${id}`;
};

window.deleteEvent = async function (id) {
    const confirmed = await showAdminConfirm({
        title: 'Delete Event?',
        message: 'Are you sure you want to delete this event? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
    });

    if (!confirmed) return;

    let events = JSON.parse(localStorage.getItem('checkmate_events')) || [];

    events = events.filter(event => String(event.id) !== String(id));

    localStorage.setItem('checkmate_events', JSON.stringify(events));

    loadAdminEventsTable();

    showAdminToast(
        'The event has been deleted successfully.',
        'success'
    );
};

window.markAsCompleted = async function (id) {
    const confirmed = await showAdminConfirm({
        title: 'Mark as Done?',
        message: 'Are you sure you want to mark this event as completed?',
        confirmText: 'Mark as Done',
        cancelText: 'Cancel',
        type: 'success'
    });

    if (!confirmed) return;

    let events = JSON.parse(localStorage.getItem('checkmate_events')) || [];

    const index = events.findIndex(
        event => String(event.id) === String(id)
    );

    if (index === -1) return;

    events[index].status = 'completed';

    localStorage.setItem('checkmate_events', JSON.stringify(events));

    adminStatusFilter = 'completed';
    updateAdminTabs();
    loadAdminEventsTable();

    showAdminToast(
        'The event has been marked as completed.',
        'success'
    );
};





/* ==========================================================================
   USERS
   ========================================================================== */

let adminUserSort = 'recent';

function renderAdminUsers() {
    const contentPanel = document.querySelector('#usersPanel');
    if (!contentPanel) return;

    let users = [];

    try {
        users = JSON.parse(localStorage.getItem('checkmate_users')) || [];

        if (!Array.isArray(users)) {
            users = [];
        }
    } catch (error) {
        users = [];
    }

    // Sort accounts without changing the saved localStorage data.
    const sortedUsers = [...users];

    if (adminUserSort === 'recent') {
        sortedUsers.sort((a, b) => {
            const dateA = new Date(a.joined || 0).getTime() || 0;
            const dateB = new Date(b.joined || 0).getTime() || 0;

            return dateB - dateA || (Number(b.id) || 0) - (Number(a.id) || 0);
        });
    } else if (adminUserSort === 'az') {
        sortedUsers.sort((a, b) => {
            const nameA = `${a.firstName || a.name || ''} ${a.surname || ''}`.trim();
            const nameB = `${b.firstName || b.name || ''} ${b.surname || ''}`.trim();

            return nameA.localeCompare(nameB, undefined, {
                sensitivity: 'base'
            });
        });
    } else if (adminUserSort === 'za') {
        sortedUsers.sort((a, b) => {
            const nameA = `${a.firstName || a.name || ''} ${a.surname || ''}`.trim();
            const nameB = `${b.firstName || b.name || ''} ${b.surname || ''}`.trim();

            return nameB.localeCompare(nameA, undefined, {
                sensitivity: 'base'
            });
        });
    }

    contentPanel.innerHTML = `
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
                <h2 class="mb-1">Registered Accounts</h2>
                <p class="text-muted mb-0">
                    Manage and view registered citizen accounts.
                </p>
            </div>

            <div class="d-flex align-items-center gap-2">
                <label for="adminUserSort" class="fw-semibold mb-0">
                    Sort by:
                </label>

                <select class="form-select"
                        id="adminUserSort"
                        style="width: 190px;">
                    <option value="recent" ${adminUserSort === 'recent' ? 'selected' : ''}>
                        Recently Added
                    </option>
                    <option value="az" ${adminUserSort === 'az' ? 'selected' : ''}>
                        Alphabetical (A–Z)
                    </option>
                    <option value="za" ${adminUserSort === 'za' ? 'selected' : ''}>
                        Alphabetical (Z–A)
                    </option>
                </select>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>First Name</th>
                        <th>Surname</th>
                        <th>Email</th>
                    </tr>
                </thead>

                <tbody>
                    ${sortedUsers.length === 0
            ? `
                            <tr>
                                <td colspan="3" class="text-center text-muted py-4">
                                    No registered accounts found.
                                </td>
                            </tr>
                        `
            : sortedUsers.map(user => {
                const [nameFirst, ...surnameParts] =
                    (user.name || '').split(' ');

                const firstName = user.firstName || nameFirst || '';
                const surname = user.surname || surnameParts.join(' ');

                return `
                                <tr>
                                    <td>${escapeHTML(firstName)}</td>
                                    <td>${escapeHTML(surname)}</td>
                                    <td>${escapeHTML(user.email || '')}</td>
                                </tr>
                            `;
            }).join('')
        }
                </tbody>
            </table>
        </div>
    `;

    // Update the displayed order when the selection changes.
    const sortSelect = document.getElementById('adminUserSort');

    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            adminUserSort = this.value;
            renderAdminUsers();
        });
    }
}



/* ==========================================================================
   CREATE / EDIT EVENT FORM
   ========================================================================== */
function setupCreateEventForm() {
    const form = document.getElementById("createEventForm");

    if (!form || form.dataset.listenerAttached === 'true') return;

    form.dataset.listenerAttached = 'true';

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const eventId = document.getElementById("eventId").value;

        const eventData = {
            title: document.getElementById("inputTitle").value.trim(),
            date: document.getElementById("inputDate").value,
            startTime: document.getElementById("inputStartTime").value,
            endTime: document.getElementById("inputEndTime").value,
            location: document.getElementById("inputLocation").value.trim(),
            category: document.getElementById("inputCategory").value,
            status: document.getElementById("inputStatus").value,
            description: document.getElementById("inputDescription").value.trim(),
            requirements: document.getElementById("inputRequirements").value.trim()
        };

        if (eventData.endTime <= eventData.startTime) {
            showAdminToast(
                'End time must be later than the start time.',
                'error',
                'Invalid Event Time'
            );
            return;
        }

        let events = JSON.parse(localStorage.getItem('checkmate_events')) || [];

        if (eventId) {
            const index = events.findIndex(e => String(e.id) === String(eventId));

            if (index !== -1) {
                events[index] = {
                    ...events[index],
                    ...eventData,
                    id: Number(eventId)
                };
            }
        } else {
            const newId = events.length
                ? Math.max(...events.map(e => Number(e.id) || 0)) + 1
                : 1;

            events.push({
    id: newId,
    ...eventData,
    createdAt: new Date().toISOString()
});
        }

        localStorage.setItem('checkmate_events', JSON.stringify(events));

        adminStatusFilter = eventData.status;

        showAdminToast(
            eventId ? 'Event updated successfully.' : 'Event published successfully.',
            'success'
        );

        window.location.hash = 'events';
    });
}

function loadEventForEditing() {
    const title = document.getElementById('createEventPageTitle');
    const eventIdInput = document.getElementById('eventId');

    if (!title || !eventIdInput) return;

    const editId = parseAdminHash().params.get('edit');

    if (!editId) {
        const form = document.getElementById('createEventForm');
        if (form) form.reset();
        title.textContent = 'Create Event';
        eventIdInput.value = '';
        document.getElementById('btnSaveEvent').textContent = 'Publish Event';
        return;
    }

    const events = JSON.parse(localStorage.getItem('checkmate_events')) || [];
    const event = events.find(e => String(e.id) === String(editId));

    if (!event) {
        window.location.href = 'admin.html#events';
        return;
    }

    title.textContent = 'Edit Event';
    document.getElementById('btnSaveEvent').textContent = 'Save Changes';

    eventIdInput.value = event.id;
    document.getElementById('inputTitle').value = event.title || '';
    document.getElementById('inputDate').value = event.date || '';
    document.getElementById('inputLocation').value = event.location || '';
    document.getElementById('inputStartTime').value = event.startTime || '';
    document.getElementById('inputEndTime').value = event.endTime || '';
    document.getElementById('inputCategory').value = event.category || 'Community';
    document.getElementById('inputStatus').value = event.status || 'upcoming';
    document.getElementById('inputDescription').value = event.description || '';
    document.getElementById('inputRequirements').value = event.requirements || '';
}


/* ==========================================================================
   LEGACY SUPPORT
   ========================================================================== */
function initLegacyAdminPortal(path) {
    if (path.includes('admin-dashboard.html')) {
        renderAdminDashboard();
    } else if (path.includes('admin-manage-events.html')) {
        renderAdminManageEvents();
    } else if (path.includes('admin-users.html')) {
        renderAdminUsers();
    }
}


/* ==========================================================================
   GLOBAL UTILITIES & NAVIGATION
   ========================================================================== */
function setupGlobalNavigation() {
    // Any link that goes to index.html is a logout link
    document.querySelectorAll('a[href="index.html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            confirmLogout();
        });
    });

    const adminBadge = document.querySelector('.admin-account');

    if (adminBadge) {
        adminBadge.style.cursor = 'pointer';
        adminBadge.title = 'Click to Logout';
        adminBadge.addEventListener('click', confirmLogout);
    }
}

function getStatusBadge(status) {
    switch (status) {
        case 'upcoming': return 'bg-primary';
        case 'ongoing': return 'bg-success';
        case 'completed': return 'bg-secondary';
        default: return 'bg-dark';
    }
}

function escapeHTML(str) {
    return String(str ?? '').replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

/* ==========================================================================
   LOGOUT CONFIRMATION POPUP
   ========================================================================== */
function confirmLogout() {
    if (document.getElementById('logoutOverlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'logout-overlay';
    overlay.id = 'logoutOverlay';
    overlay.innerHTML = `
        <div class="logout-box" role="dialog" aria-modal="true" aria-labelledby="logoutTitle">
            <h3 id="logoutTitle">Confirm logout?</h3>
            <div class="logout-actions">
                <button type="button" class="logout-cancel">Cancel</button>
                <button type="button" class="logout-confirm">Logout</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();

    overlay.querySelector('.logout-cancel').addEventListener('click', close);
    overlay.querySelector('.logout-confirm').addEventListener('click', () => {
        sessionStorage.removeItem('checkmate_user');
        window.location.href = 'index.html';
    });

    // Click outside the box or press Esc to cancel
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function onKey(e) {
        if (e.key === 'Escape') {
            close();
            document.removeEventListener('keydown', onKey);
        }
    });

    overlay.querySelector('.logout-cancel').focus();
}


/* ==========================================================================
   NOTIFICATIONS
   The admin picks an existing event (placard) and confirms. The notification
   is saved to 'checkmate_notifications', which the citizen portal reads, and
   the admin gets their own copy in the bell's "Sent" tab.
   ========================================================================== */
const CM_NOTIF_KEY = 'checkmate_notifications';
const CM_ADMIN_READ_KEY = 'checkmate_notif_read_admin';

function getNotifications() {
    try {
        const list = JSON.parse(localStorage.getItem(CM_NOTIF_KEY));
        return Array.isArray(list) ? list : [];
    } catch (err) {
        return [];
    }
}

function saveNotifications(list) {
    // Keep only the 50 newest so storage never grows forever
    localStorage.setItem(CM_NOTIF_KEY, JSON.stringify(list.slice(0, 50)));
}

function getAdminReadIds() {
    try {
        const ids = JSON.parse(localStorage.getItem(CM_ADMIN_READ_KEY));
        return Array.isArray(ids) ? ids : [];
    } catch (err) {
        return [];
    }
}

function updateAdminNotifBadge() {
    const badge = document.getElementById('adminNotifBadge');
    if (!badge) return;

    const read = new Set(getAdminReadIds());
    const unread = getNotifications().filter(n => !read.has(n.id)).length;

    badge.textContent = unread > 9 ? '9+' : unread;
    badge.hidden = unread === 0;
}

function setupAdminNotifications() {
    const bell = document.getElementById('adminNotifBtn');
    if (!bell) return;

    bell.addEventListener('click', () => {
        // Ask for laptop-notification permission the first time the bell is used
        cmRequestDesktopPermission();
        openNotifyModal();
    });
    updateAdminNotifBadge();

    // Keep the badge in sync when another tab changes notifications
    window.addEventListener('storage', e => {
        if (e.key === CM_NOTIF_KEY || e.key === CM_ADMIN_READ_KEY) {
            updateAdminNotifBadge();
        }
    });
}

function formatNotifTime(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}

function sendEventNotification(event) {
    let sentBy = 'Administrator';

    try {
        const session = JSON.parse(sessionStorage.getItem('checkmate_user'));
        if (session && session.name) sentBy = session.name;
    } catch (err) { }

    const notification = {
        id: `n${Date.now()}${Math.floor(Math.random() * 1000)}`,
        eventId: event.id,
        title: event.title || 'Untitled event',
        category: event.category || 'Community',
        date: event.date || '',
        location: event.location || '',
        status: event.status || 'upcoming',
        sentAt: new Date().toISOString(),
        sentBy
    };

    const list = getNotifications();
    list.unshift(notification);
    saveNotifications(list);

    return notification;
}

function openNotifyModal() {
    if (document.getElementById('notifyOverlay')) return;

    // Make sure statuses are fresh before the admin chooses
    updateExpiredEvents();

    const events = JSON.parse(localStorage.getItem('checkmate_events')) || [];
    const users = JSON.parse(localStorage.getItem('checkmate_users')) || [];
    const citizenCount = users.filter(u => u.role !== 'Admin').length;

    let selectedId = null;
    let activeTab = 'send';
    let query = '';

    const overlay = document.createElement('div');
    overlay.className = 'cm-confirm-overlay';
    overlay.id = 'notifyOverlay';

    overlay.innerHTML = `
        <div class="cm-confirm-box cm-notify-box" role="dialog"
             aria-modal="true" aria-labelledby="notifyTitle">
            <div class="cm-confirm-icon"><i class="bx bx-bell"></i></div>
            <h3 id="notifyTitle">Notifications</h3>
            <p class="cm-notify-sub" id="notifySub"></p>

            <div class="cm-notify-tabs" role="tablist">
                <button type="button" class="cm-notify-tab" data-tab="send">Send</button>
                <button type="button" class="cm-notify-tab" data-tab="history">Sent</button>
            </div>

            <div class="cm-notify-body" id="notifyBody"></div>
            <div class="cm-confirm-actions" id="notifyActions"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    const sub = overlay.querySelector('#notifySub');
    const body = overlay.querySelector('#notifyBody');
    const actions = overlay.querySelector('#notifyActions');

    function close() {
        document.removeEventListener('keydown', onKey);
        overlay.remove();
        updateAdminNotifBadge();
    }

    function onKey(e) {
        if (e.key === 'Escape') close();
    }

    document.addEventListener('keydown', onKey);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    overlay.querySelectorAll('.cm-notify-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            activeTab = tab.dataset.tab;
            render();
        });
    });

    function render() {
        overlay.querySelectorAll('.cm-notify-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === activeTab);
        });

        if (activeTab === 'send') renderSend();
        else renderHistory();
    }

    /* ---------- SEND TAB ---------- */
    function renderSend() {
        body.innerHTML = `
            <div class="cm-notify-search">
                <i class="bx bx-search"></i>
                <input type="search" id="notifySearch" placeholder="Search events..."
                       aria-label="Search events" autocomplete="off" value="${escapeHTML(query)}">
            </div>
            <div class="cm-notify-list" id="notifyList"></div>
        `;

        actions.innerHTML = `
            <button type="button" class="cm-confirm-cancel" id="notifyCancel">Cancel</button>
            <button type="button" class="cm-confirm-accept" id="notifyYes" disabled>Yes, Notify</button>
        `;

        body.querySelector('#notifySearch').addEventListener('input', e => {
            query = e.target.value;
            renderList();
        });

        actions.querySelector('#notifyCancel').addEventListener('click', close);
        actions.querySelector('#notifyYes').addEventListener('click', confirmSend);

        renderList();
        updateSendState();
    }

    function renderList() {
        const list = body.querySelector('#notifyList');
        if (!list) return;

        const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        const order = { ongoing: 0, upcoming: 1, completed: 2 };

        const shown = events
            .filter(e => {
                const text = `${e.title || ''} ${e.category || ''} ${e.location || ''}`.toLowerCase();
                return words.every(w => text.includes(w));
            })
            .sort((a, b) =>
                (order[a.status] ?? 3) - (order[b.status] ?? 3) ||
                String(a.date || '').localeCompare(String(b.date || ''))
            );

        if (shown.length === 0) {
            list.innerHTML = `
                <div class="cm-notify-empty">
                    <i class="bx bx-calendar"></i>
                    <p>${events.length === 0 ? 'No events yet. Create an event first.' : 'No matching events found.'}</p>
                </div>
            `;
            return;
        }

        list.innerHTML = shown.map(e => `
            <label class="cm-notify-item ${String(e.id) === String(selectedId) ? 'selected' : ''}">
                <input type="radio" name="notifyEvent" value="${escapeHTML(e.id)}"
                       ${String(e.id) === String(selectedId) ? 'checked' : ''}>
                <span class="cm-notify-radio"></span>
                <span class="cm-notify-info">
                    <strong title="${escapeHTML(e.title)}">${escapeHTML(e.title)}</strong>
                    <small>${escapeHTML(e.category || 'Community')} • ${escapeHTML(e.date || '—')} • ${escapeHTML(e.location || '—')}</small>
                </span>
                <span class="badge ${getStatusBadge(e.status)}">${escapeHTML(e.status)}</span>
            </label>
        `).join('');

        list.querySelectorAll('input[name="notifyEvent"]').forEach(radio => {
            radio.addEventListener('change', () => {
                selectedId = radio.value;
                list.querySelectorAll('.cm-notify-item').forEach(item => {
                    item.classList.toggle('selected', item.querySelector('input').checked);
                });
                updateSendState();
            });
        });
    }

    function updateSendState() {
        const yes = actions.querySelector('#notifyYes');
        const selected = events.find(e => String(e.id) === String(selectedId));

        if (selected) {
            sub.textContent = `Notify ${citizenCount} citizen${citizenCount === 1 ? '' : 's'} and the admin about "${selected.title}"?`;
        } else {
            sub.textContent = 'Select an event placard to notify all citizens and the admin.';
        }

        if (yes) yes.disabled = !selected;
    }

    function confirmSend() {
        const selected = events.find(e => String(e.id) === String(selectedId));
        if (!selected) return;

        sendEventNotification(selected);
        close();

        // Also pop up on the admin's laptop
        cmDesktopNotify(
            'Notification Sent',
            `"${selected.title}" was sent to ${citizenCount} citizen${citizenCount === 1 ? '' : 's'} and the admin.`,
            'checkmate-admin-sent'
        );

        showAdminToast(
            `"${selected.title}" was sent to ${citizenCount} citizen${citizenCount === 1 ? '' : 's'} and the admin.`,
            'success',
            'Notification Sent'
        );
    }

    /* ---------- SENT TAB ---------- */
    function renderHistory() {
        const notifications = getNotifications();
        const read = new Set(getAdminReadIds());

        sub.textContent = 'Notifications sent to citizens and the admin.';

        body.innerHTML = notifications.length === 0
            ? `
                <div class="cm-notify-empty">
                    <i class="bx bx-bell"></i>
                    <p>No notifications sent yet.</p>
                </div>`
            : `<div class="cm-notify-list">
                ${notifications.map(n => `
                    <div class="cm-notify-history ${read.has(n.id) ? '' : 'unread'}">
                        <span class="cm-notify-history-icon"><i class="bx bx-bell"></i></span>
                        <span class="cm-notify-info">
                            <strong title="${escapeHTML(n.title)}">${escapeHTML(n.title)}</strong>
                            <small>${escapeHTML(n.category)} • ${escapeHTML(n.date || '—')} • ${escapeHTML(n.location || '—')}</small>
                            <small class="cm-notify-time">Sent ${escapeHTML(formatNotifTime(n.sentAt))} by ${escapeHTML(n.sentBy)}</small>
                        </span>
                    </div>
                `).join('')}
              </div>`;

        actions.innerHTML = `<button type="button" class="cm-confirm-accept" id="notifyClose">Close</button>`;
        actions.querySelector('#notifyClose').addEventListener('click', close);

        // Viewing the Sent tab marks everything as read for the admin
        localStorage.setItem(CM_ADMIN_READ_KEY, JSON.stringify(notifications.map(n => n.id)));
        updateAdminNotifBadge();
    }

    render();
    overlay.querySelector('.cm-notify-tab.active').focus();
}


/* ==========================================================================
   DESKTOP (LAPTOP) NOTIFICATIONS
   Uses the browser's Notification API. Needs one-time permission, and the
   page must be served from https:// or http://localhost (not file://).
   ========================================================================== */
function cmDesktopSupported() {
    return 'Notification' in window;
}

function cmDesktopNotify(title, body, tag, onClick) {
    if (!cmDesktopSupported() || Notification.permission !== 'granted') return;

    try {
        const n = new Notification(title, {
            body,
            tag,
            icon: '../img/CMicon.png'
        });

        n.onclick = () => {
            window.focus();
            n.close();
            if (typeof onClick === 'function') onClick();
        };
    } catch (err) {
        // Some browsers only allow notifications through a service worker
    }
}

function cmRequestDesktopPermission() {
    if (!cmDesktopSupported() || Notification.permission !== 'default') {
        return Promise.resolve(cmDesktopSupported() ? Notification.permission : 'unsupported');
    }

    return Notification.requestPermission();
}