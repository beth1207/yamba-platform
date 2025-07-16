// script.js - global logic for Yamba MVP signup (expand later)

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  if (!signupForm) return; // Only run on signup page

  signupForm.addEventListener('submit', e => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const skills = document.getElementById('skills').value.trim();
    const terms = document.getElementById('terms').checked;

    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (!terms) {
      alert("You must accept the Terms & Conditions.");
      return;
    }

    // Load existing users from localStorage or create empty array
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Check for duplicate phone number
    if (users.some(u => u.phoneNumber === phoneNumber)) {
      alert("Phone number already registered.");
      return;
    }

    // Save new user
    const newUser = {
      fullName,
      phoneNumber,
      password, // In real app, NEVER store plain passwords!
      skills: skills.split(',').map(s => s.trim().toLowerCase()),
      subscriptionExpiry: null, // to implement later
      userType: null // to implement later (poster/seeker)
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('activeUser', JSON.stringify(newUser));

    alert("Signup successful! You will be logged in.");
    window.location.href = 'home.html'; // Redirect to home/dashboard
  });

  // --- JOBS LIST PAGE LOGIC ---
const jobsContainer = document.getElementById('jobsContainer');
if (jobsContainer) {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  if (!activeUser) {
    alert('Please login first.');
    window.location.href = 'login.html';
  } else {
    let jobs = JSON.parse(localStorage.getItem('jobList')) || [];
    const now = Date.now();

    // Filter jobs that are not expired or cancelled or completed
    jobs = jobs.filter(job => job.status === 'open' && job.expiresAt > now);

    if (jobs.length === 0) {
      jobsContainer.innerHTML = '<p>No available jobs at the moment.</p>';
    } else {
      jobsContainer.innerHTML = '';
      jobs.forEach(job => {
        // Can't claim own jobs
        if (job.posterPhone === activeUser.phoneNumber) return;

        // Build job card HTML
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.style.border = '1px solid #ccc';
        jobCard.style.padding = '15px';
        jobCard.style.marginBottom = '15px';
        jobCard.style.borderRadius = '6px';

        let budgetInfo = '';
        if (job.jobType === 'closed') {
          budgetInfo = `<p><strong>Budget:</strong> UGX ${job.budget.toLocaleString()} ${job.negotiable ? '(Negotiable)' : ''}</p>`;
        }

        jobCard.innerHTML = `
          <h3>${job.title}</h3>
          <p>${job.description}</p>
          <p><strong>Duration:</strong> ${job.duration} day(s)</p>
          ${budgetInfo}
          <button data-id="${job.id}" class="viewDetailsBtn">View Details</button>
        `;

        jobsContainer.appendChild(jobCard);
      });

      // Add event listeners for View Details buttons
      document.querySelectorAll('.viewDetailsBtn').forEach(btn => {
        btn.addEventListener('click', e => {
          const jobId = e.target.getAttribute('data-id');
          window.location.href = `job.html?id=${encodeURIComponent(jobId)}`;
        });
      });
    }
  }
}

// --- JOB DETAILS PAGE LOGIC ---
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('id');
if (jobId) {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  if (!activeUser) {
    alert('Please login first.');
    window.location.href = 'login.html';
  } else {
    let jobs = JSON.parse(localStorage.getItem('jobList')) || [];
    const job = jobs.find(j => j.id === jobId);

    if (!job) {
      alert('Job not found.');
      window.location.href = 'jobs.html';
    } else {
      document.getElementById('jobTitle').textContent = job.title;
      document.getElementById('jobDescription').textContent = job.description;
      document.getElementById('jobType').textContent = job.jobType === 'open' ? 'Open' : 'Closed';
      document.getElementById('numIndividuals').textContent = job.numIndividuals;
      document.getElementById('duration').textContent = job.duration;
      document.getElementById('posterName').textContent = job.posterName;

      const budgetInfoElem = document.getElementById('budgetInfo');
      if (job.jobType === 'closed') {
        budgetInfoElem.textContent = `Budget: UGX ${job.budget.toLocaleString()} ${job.negotiable ? '(Negotiable)' : ''}`;
      } else {
        budgetInfoElem.textContent = '';
      }

      const claimBtn = document.getElementById('claimJobBtn');
      // Disable claim button if poster or job not open
      if (activeUser.phoneNumber === job.posterPhone || job.status !== 'open') {
        claimBtn.disabled = true;
        claimBtn.textContent = 'Cannot Claim This Job';
      }

      claimBtn.addEventListener('click', () => {
        // Check if user already has claimed a job (for closed tasks only 1 job at a time)
        const currentClaim = JSON.parse(localStorage.getItem('currentJob'));
        if (currentClaim && currentClaim.claimedBy === activeUser.phoneNumber) {
          alert('You have already claimed a job. Complete it before claiming another.');
          return;
        }

        // Confirm availability
        if (!confirm('Confirm you will be available during the job duration.')) return;

        // Mark job as claimed
        job.claimedBy.push(activeUser.phoneNumber);
        if (job.jobType === 'closed') {
          job.status = 'claimed'; // closed jobs only one claimant
          localStorage.setItem('currentJob', JSON.stringify({ id: job.id, claimedBy: activeUser.phoneNumber }));
        }

        localStorage.setItem('jobList', JSON.stringify(jobs));
        alert('Job claimed successfully!');
        window.location.href = 'my-jobs.html';
      });

      // Share job button
      document.getElementById('shareJobBtn').addEventListener('click', () => {
        const shareURL = window.location.href;
        if (navigator.share) {
          navigator.share({
            title: `Job: ${job.title}`,
            text: `Check out this job on Yamba!`,
            url: shareURL,
          }).catch(err => alert('Error sharing: ' + err));
        } else {
          prompt('Copy this link to share:', shareURL);
        }
      });
    }
  }
}

// --- ACCOUNT PAGE LOGIC ---
const accountForm = document.getElementById('accountForm');
if (accountForm) {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  if (!activeUser) {
    alert('Please login first.');
    window.location.href = 'login.html';
  } else {
    // Prefill form
    document.getElementById('editFullName').value = activeUser.fullName;
    document.getElementById('editPhoneNumber').value = activeUser.phoneNumber;
    document.getElementById('editSkills').value = activeUser.skills.join(', ');

    accountForm.addEventListener('submit', e => {
      e.preventDefault();

      const fullName = document.getElementById('editFullName').value.trim();
      const skills = document.getElementById('editSkills').value.trim();

      if (!fullName || !skills) {
        alert('Please fill all fields.');
        return;
      }

      // Update active user
      activeUser.fullName = fullName;
      activeUser.skills = skills.split(',').map(s => s.trim().toLowerCase());

      // Update users list in localStorage
      let users = JSON.parse(localStorage.getItem('users')) || [];
      users = users.map(u => u.phoneNumber === activeUser.phoneNumber ? activeUser : u);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('activeUser', JSON.stringify(activeUser));

      alert('Profile updated successfully!');
    });
  }
}

// --- SUBSCRIPTION PAGE LOGIC ---
const subscriptionStatus = document.getElementById('subscriptionStatus');
const subscriptionForm = document.getElementById('subscriptionForm');
if (subscriptionStatus && subscriptionForm) {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  if (!activeUser) {
    alert('Please login first.');
    window.location.href = 'login.html';
  } else {
    // Show current subscription expiry or prompt to pay
    const now = Date.now();
    const expiry = activeUser.subscriptionExpiry ? activeUser.subscriptionExpiry : 0;

    if (expiry && expiry > now) {
      const expiryDate = new Date(expiry);
      subscriptionStatus.textContent = `Your subscription is active until ${expiryDate.toDateString()}.`;
    } else {
      subscriptionStatus.textContent = 'Your subscription has expired or is not active.';
    }

    subscriptionForm.addEventListener('submit', e => {
      e.preventDefault();

      const provider = document.getElementById('paymentProvider').value;
      const payPhone = document.getElementById('paymentPhone').value.trim();

      if (!provider || !payPhone) {
        alert('Please select provider and enter payment phone number.');
        return;
      }

      // Simulate payment PIN prompt
      const pin = prompt(`Enter PIN for ${provider} payment:`);

      if (pin && pin.length >= 4) {
        // Simulate successful payment
        const newExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // +30 days
        alert('Payment successful! Subscription extended by 1 month.');
window.location.href = 'home.html';

        activeUser.subscriptionExpiry = newExpiry;

        // Update users list
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.map(u => u.phoneNumber === activeUser.phoneNumber ? activeUser : u);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('activeUser', JSON.stringify(activeUser));

        alert('Payment successful! Subscription extended by 1 month.');
        subscriptionStatus.textContent = `Your subscription is active until ${new Date(newExpiry).toDateString()}.`;
      } else {
        alert('Payment failed or cancelled.');
      }
    });
  }
}

// --- MY JOBS PAGE LOGIC ---
const myJobsContainer = document.getElementById('myJobsContainer');
if (myJobsContainer) {
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  if (!activeUser) {
    alert('Please login first.');
    window.location.href = 'login.html';
  } else {
    let jobs = JSON.parse(localStorage.getItem('jobList')) || [];
    jobs = jobs.filter(job => job.posterPhone === activeUser.phoneNumber);

    if (jobs.length === 0) {
      myJobsContainer.innerHTML = '<p>You have not posted any jobs yet.</p>';
    } else {
      myJobsContainer.innerHTML = '';
      jobs.forEach(job => {
        const jobDiv = document.createElement('div');
        jobDiv.className = 'job-card';
        jobDiv.style.border = '1px solid #ccc';
        jobDiv.style.padding = '15px';
        jobDiv.style.marginBottom = '15px';
        jobDiv.style.borderRadius = '6px';

        let budgetInfo = '';
        if (job.jobType === 'closed') {
          budgetInfo = `<p><strong>Budget:</strong> UGX ${job.budget.toLocaleString()} ${job.negotiable ? '(Negotiable)' : ''}</p>`;
        }

        let claimedByList = job.claimedBy.length ? job.claimedBy.join(', ') : 'None';

        jobDiv.innerHTML = `
          <h3>${job.title}</h3>
          <p>${job.description}</p>
          <p><strong>Duration:</strong> ${job.duration} day(s)</p>
          ${budgetInfo}
          <p><strong>Claimed By:</strong> ${claimedByList}</p>
          <p><strong>Status:</strong> ${job.status}</p>
          <button data-id="${job.id}" class="cancelJobBtn" ${job.status !== 'open' ? 'disabled' : ''}>Cancel Job</button>
        `;

        myJobsContainer.appendChild(jobDiv);
      });

      // Cancel job buttons
      document.querySelectorAll('.cancelJobBtn').forEach(btn => {
        btn.addEventListener('click', e => {
          const jobId = e.target.getAttribute('data-id');
          if (confirm('Are you sure you want to cancel this job?')) {
            let jobs = JSON.parse(localStorage.getItem('jobList')) || [];
            const jobIndex = jobs.findIndex(j => j.id === jobId);
            if (jobIndex !== -1) {
              jobs[jobIndex].status = 'cancelled';
              localStorage.setItem('jobList', JSON.stringify(jobs));
              alert('Job cancelled.');
              window.location.reload();
            }
          }
        });
      });
    }
  }
}

// --- HELP PAGE LOGIC ---
const helpForm = document.getElementById('helpForm');
if (helpForm) {
  helpForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('helpName').value.trim();
    const email = document.getElementById('helpEmail').value.trim();
    const message = document.getElementById('helpMessage').value.trim();

    if (!name || !email || !message) {
      alert('Please fill all fields.');
      return;
    }

    // Since no backend, simulate sending message
    alert('Thank you for contacting support. We will get back to you shortly.');

    helpForm.reset();
  });
}


});

document.addEventListener('DOMContentLoaded', () => {
  // LOGIN PAGE LOGIC
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const phone = document.getElementById('loginPhone').value.trim();
      const password = document.getElementById('loginPassword').value;

      let users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.phoneNumber === phone && u.password === password);

      if (user) {
        localStorage.setItem('activeUser', JSON.stringify(user));
        alert('Login successful!');
        window.location.href = 'home.html';
      } else {
        alert('Invalid phone number or password.');
      }
    });
  }

  // HOME PAGE LOGIC
  const welcomeMsg = document.getElementById('welcomeMsg');
  if (welcomeMsg) {
    const activeUser = JSON.parse(localStorage.getItem('activeUser'));
    if (activeUser) {
      welcomeMsg.textContent = `Hello, ${activeUser.fullName}!`;
    } else {
      alert('Please login first.');
      window.location.href = 'login.html';
    }
  }

  // LOGOUT BUTTON LOGIC (common to pages with logoutBtn)
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      localStorage.removeItem('activeUser');
      alert('Logged out successfully.');
      window.location.href = 'login.html';
    });
  }

  // POST JOB FORM LOGIC
  const postJobForm = document.getElementById('postJobForm');
  if (postJobForm) {
    postJobForm.addEventListener('submit', e => {
      e.preventDefault();
      const activeUser = JSON.parse(localStorage.getItem('activeUser'));
      if (!activeUser) {
        alert('Please login to post a job.');
        window.location.href = 'login.html';
        return;
      }

      const title = document.getElementById('jobTitle').value.trim();
      const description = document.getElementById('jobDescription').value.trim();
      const jobType = document.getElementById('jobType').value;
      const numIndividuals = parseInt(document.getElementById('numIndividuals').value);
      const budget = document.getElementById('budget').value ? parseFloat(document.getElementById('budget').value) : null;
      const negotiable = document.getElementById('negotiable').checked;
      const duration = parseInt(document.getElementById('duration').value);

      if (!title || !description || !jobType || !numIndividuals || !duration) {
        alert('Please fill in all required fields.');
        return;
      }

      if (jobType === 'closed' && (budget === null || isNaN(budget))) {
        alert('Please enter a valid budget for closed jobs.');
        return;
      }

      // Create job ID: job-{posterName}_{YYYYMMDD}_{HHMMSS}__{expiresAt}__{claimedBy}
      const now = new Date();
      const formatDate = d => d.toISOString().slice(0,10).replace(/-/g,'');
      const formatTime = d => d.toTimeString().slice(0,8).replace(/:/g,'');
      const expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000).getTime();

      const jobId = `job-${activeUser.fullName.replace(/\s+/g,'')}_${formatDate(now)}_${formatTime(now)}__${expiresAt}__`;

      let jobs = JSON.parse(localStorage.getItem('jobList')) || [];

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
        status: 'open', // open, claimed, cancelled, expired, completed
      };

      jobs.push(newJob);
      localStorage.setItem('jobList', JSON.stringify(jobs));
      alert('Job posted successfully!');
      window.location.href = 'my-jobs.html';
    });
  }
});

function toggleMenu() {
  const nav = document.getElementById('navMenu');
  nav.classList.toggle('show');
}