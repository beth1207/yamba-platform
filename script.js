// script.js - global logic for Yamba MVP signup (expand later)

document.addEventListener('DOMContentLoaded', () => {
  // === SIGNUP LOGIC ===
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e)  {
      e.preventDefault();
       alert('Signup successful!');
      window.location.href = 'login.html';
      const fullName = document.getElementById('fullName').value.trim();
      const phoneNumber = document.getElementById('phone').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const skills = document.getElementById('skills').value.trim();
      const terms = document.getElementById('terms').checked;

      if (password !== confirmPassword) return alert("Passwords don't match!");
      if (!terms) return alert("You must accept the Terms & Conditions.");

      let users = JSON.parse(localStorage.getItem('users')) || [];
      if (users.some(u => u.phoneNumber === phoneNumber)) return alert("Phone number already registered.");

      const newUser = {
        fullName,
        phoneNumber,
        password,
        skills: skills.split(',').map(s => s.trim().toLowerCase()),
        subscriptionExpiry: null,
        userType: null
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('activeUser', JSON.stringify(newUser));
      alert("Signup successful! You will be logged in.");
      window.location.href = 'index.html';
    });
  }

  // === LOGIN PAGE ===
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const phone = document.getElementById('loginPhone').value.trim();
      const password = document.getElementById('loginPassword').value;
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.phoneNumber === phone && u.password === password);
      if (!user) return alert('Invalid phone number or password.');
      localStorage.setItem('activeUser', JSON.stringify(user));
      // alert('Login successful!');
      window.location.href = 'index.html';
    });
  }

  // === LOGOUT ===
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('activeUser');
      alert('Logged out successfully.');
      window.location.href = 'login.html';
    });
  }

  // === WELCOME MESSAGE ON HOME PAGE ===
  const welcomeMsg = document.getElementById('welcomeMsg');
  if (welcomeMsg) {
    const activeUser = JSON.parse(localStorage.getItem('activeUser'));
    if (activeUser) {
      welcomeMsg.textContent = `Hello, ${activeUser.fullName}!`;
    } else {
      window.location.href = 'login.html';
    }
  }

  // === POST JOB ===
  const postJobForm = document.getElementById('postJobForm');
  if (postJobForm) {
    postJobForm.addEventListener('submit', e => {
      e.preventDefault();
      const activeUser = JSON.parse(localStorage.getItem('activeUser'));
      if (!activeUser) return window.location.href = 'login.html';

      const title = document.getElementById('jobTitle').value.trim();
      const description = document.getElementById('jobDescription').value.trim();
      const jobType = document.getElementById('jobType').value;
      const numIndividuals = parseInt(document.getElementById('numIndividuals').value);
      const budget = parseFloat(document.getElementById('budget').value || 0);
      const negotiable = document.getElementById('negotiable').checked;
      const duration = parseInt(document.getElementById('duration').value);

      if (!title || !description || !jobType || !numIndividuals || !duration || (jobType === 'closed' && isNaN(budget))) {
        return alert('Please fill in all required fields.');
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000).getTime();
      const jobId = `job-${activeUser.fullName.replace(/\s+/g, '')}_${now.getTime()}`;

      const jobList = JSON.parse(localStorage.getItem('jobList')) || [];
      const newJob = {
        id: jobId,
        posterPhone: activeUser.phoneNumber,
        posterName: activeUser.fullName,
        title,
        description,
        jobType,
        numIndividuals,
        budget,
        negotiable,
        duration,
        expiresAt,
        claimedBy: [],
        status: 'open',
        requiredSkills: activeUser.skills
      };

      jobList.push(newJob);
      localStorage.setItem('jobList', JSON.stringify(jobList));
      alert('Job posted successfully!');
      window.location.href = 'my-jobs.html';
    });
  }

  // === JOB LIST PAGE (MATCHED JOBS FOR SEEKER) ===
  const jobsContainer = document.getElementById('jobsContainer');
  if (jobsContainer) {
    const activeUser = JSON.parse(localStorage.getItem('activeUser'));
    if (!activeUser) return window.location.href = 'login.html';

    let jobs = JSON.parse(localStorage.getItem('jobList')) || [];
    const now = Date.now();
    jobs = jobs.filter(job => job.status === 'open' && job.expiresAt > now);

    let matched = 0;
    jobsContainer.innerHTML = '';

    jobs.forEach(job => {
      if (job.posterPhone === activeUser.phoneNumber) return;
      const skillMatch = job.requiredSkills?.some(skill => activeUser.skills.includes(skill));
      if (!skillMatch) return;
      matched++;

      const div = document.createElement('div');
      div.className = 'job-card';
      div.innerHTML = `
        <h3>${job.title}</h3>
        <p>${job.description}</p>
        <p><strong>Duration:</strong> ${job.duration} day(s)</p>
        ${job.jobType === 'closed' ? `<p><strong>Budget:</strong> UGX ${job.budget} ${job.negotiable ? '(Negotiable)' : ''}</p>` : ''}
        <a href="job.html?id=${job.id}">View Details</a>
      `;
      jobsContainer.appendChild(div);
    });

    if (matched === 0) {
      jobsContainer.innerHTML = '<p>No jobs match your skill set at the moment. Add or update your skills in your <a href="account.html">Account</a>.</p>';
    }
  }

  // === MY JOBS PAGE ===
  const myJobsContainer = document.getElementById('myJobsContainer');
  if (myJobsContainer) {
    const activeUser = JSON.parse(localStorage.getItem('activeUser'));
    if (!activeUser) return window.location.href = 'login.html';

    let jobs = JSON.parse(localStorage.getItem('jobList')) || [];
    jobs = jobs.filter(job => job.posterPhone === activeUser.phoneNumber);

    if (jobs.length === 0) {
      myJobsContainer.innerHTML = '<p>You have not posted any jobs yet.</p>';
    } else {
      jobs.forEach(job => {
        const div = document.createElement('div');
        div.className = 'job-card';
        div.innerHTML = `
          <h3>${job.title}</h3>
          <p>${job.description}</p>
          <p><strong>Duration:</strong> ${job.duration} day(s)</p>
          ${job.jobType === 'closed' ? `<p><strong>Budget:</strong> UGX ${job.budget}</p>` : ''}
          <p><strong>Status:</strong> ${job.status}</p>
          <p><strong>Claimed By:</strong> ${job.claimedBy.join(', ') || 'None'}</p>
          <button class="cancelBtn" data-id="${job.id}" ${job.status !== 'open' ? 'disabled' : ''}>Cancel</button>
        `;
        myJobsContainer.appendChild(div);
      });

      document.querySelectorAll('.cancelBtn').forEach(btn => {
        btn.addEventListener('click', e => {
          const id = e.target.getAttribute('data-id');
          let jobs = JSON.parse(localStorage.getItem('jobList')) || [];
          const jobIndex = jobs.findIndex(j => j.id === id);
          if (jobIndex !== -1) {
            jobs[jobIndex].status = 'cancelled';
            localStorage.setItem('jobList', JSON.stringify(jobs));
            alert('Job cancelled.');
            window.location.reload();
          }
        });
      });
    }
  }

  // === SUBSCRIPTION PAGE ===
  const subscriptionForm = document.getElementById('subscriptionForm');
  const subscriptionStatus = document.getElementById('subscriptionStatus');
  if (subscriptionForm && subscriptionStatus) {
    const activeUser = JSON.parse(localStorage.getItem('activeUser'));
    if (!activeUser) return window.location.href = 'login.html';

    const now = Date.now();
    const expiry = activeUser.subscriptionExpiry || 0;
    subscriptionStatus.textContent = expiry > now ? `Active until ${new Date(expiry).toDateString()}` : 'Subscription inactive.';

    subscriptionForm.addEventListener('submit', e => {
      e.preventDefault();
      const provider = document.getElementById('paymentProvider').value;
      const phone = document.getElementById('paymentPhone').value.trim();
      if (!provider || !phone) return alert('Enter provider and phone number.');
      const pin = prompt(`Enter PIN for ${provider}`);
      if (!pin || pin.length < 4) return alert('Payment failed.');

      const newExpiry = now + 30 * 24 * 60 * 60 * 1000;
      activeUser.subscriptionExpiry = newExpiry;
      let users = JSON.parse(localStorage.getItem('users')) || [];
      users = users.map(u => u.phoneNumber === activeUser.phoneNumber ? activeUser : u);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('activeUser', JSON.stringify(activeUser));
      subscriptionStatus.textContent = `Active until ${new Date(newExpiry).toDateString()}`;
      alert('Subscription extended by 1 month.');
      window.location.href = 'index.html';
    });
  }


});

// Toggle mobile navigation menu
function toggleMenu() {
  const mobileNav = document.getElementById('mobileNav');
  const hamburger = document.querySelector('.hamburger');
  mobileNav.classList.toggle('open');
  // Optional: Toggle hamburger icon
  if (mobileNav.classList.contains('open')) {
    hamburger.textContent = '✖';
  } else {
    hamburger.textContent = '☰';
  }
}

window.addEventListener('resize', () => {
  const mobileNav = document.getElementById('mobileNav');
  const hamburger = document.querySelector('.hamburger');
  if (window.innerWidth > 600) {
    mobileNav.classList.remove('open');
    if (hamburger) hamburger.textContent = '☰';
  }
});
