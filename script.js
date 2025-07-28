// script.js - optimized and fixed version

// Debug function
function debugStorage() {
  console.log("=== DEBUG ===");
  console.log("Active User:", JSON.parse(localStorage.getItem('activeUser')));
  console.log("Job List:", JSON.parse(localStorage.getItem('jobList')));
  console.log("Users:", JSON.parse(localStorage.getItem('users')));
}

// Account Page Functions
function initializeAccountPage() {
  const accountForm = document.getElementById('accountForm');
  if (!accountForm) return;

  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  if (!activeUser) {
    window.location.href = 'account.html';
    return;
  }

  document.getElementById('fullName').value = activeUser.fullName || '';
  document.getElementById('phone').textContent = activeUser.phoneNumber || '';

  function displaySkills() {
    const skillsContainer = document.getElementById('skillsDisplay');
    skillsContainer.innerHTML = '';
    
    if (activeUser.skills && activeUser.skills.length > 0) {
      activeUser.skills.forEach(skill => {
        if (skill.trim()) {
          const skillTag = document.createElement('span');
          skillTag.className = 'skill-tag';
          skillTag.textContent = skill;
          skillsContainer.appendChild(skillTag);
        }
      });
    } else {
      skillsContainer.innerHTML = '<span class="no-skills">No skills added yet</span>';
    }
  }

  displaySkills();

  // Edit name functionality
  document.querySelector('.edit-btn[data-field="fullName"]')?.addEventListener('click', function() {
    const field = document.getElementById('fullName');
    const btn = this;
    
    if (field.readOnly) {
      field.readOnly = false;
      field.focus();
      btn.textContent = 'Save';
    } else {
      const newName = field.value.trim();
      if (!newName) {
        alert('Name cannot be empty');
        return;
      }
      
      activeUser.fullName = newName;
      updateUserData();
      
      field.readOnly = true;
      btn.textContent = 'Edit';
      showStatus('Name updated successfully', 'success');
    }
  });

  // Skills edit functionality
  document.getElementById('editSkills')?.addEventListener('click', function() {
    document.getElementById('skillsDisplay').style.display = 'none';
    document.getElementById('skillsEdit').style.display = 'block';
    document.getElementById('skillsInput').value = activeUser.skills ? activeUser.skills.join(', ') : '';
    this.style.display = 'none';
  });

  document.getElementById('saveSkills')?.addEventListener('click', function() {
    const skillsText = document.getElementById('skillsInput').value.trim();
    const skillsArray = skillsText.split(',').map(s => s.trim()).filter(s => s);
    
    activeUser.skills = skillsArray;
    updateUserData();
    
    document.getElementById('skillsDisplay').style.display = 'flex';
    document.getElementById('skillsEdit').style.display = 'none';
    document.getElementById('editSkills').style.display = 'inline-block';
    displaySkills();
    showStatus('Skills updated successfully', 'success');
  });

  document.getElementById('cancelSkills')?.addEventListener('click', function() {
    document.getElementById('skillsDisplay').style.display = 'flex';
    document.getElementById('skillsEdit').style.display = 'none';
    document.getElementById('editSkills').style.display = 'inline-block';
  });

  // Password change functionality
  document.getElementById('editPassword')?.addEventListener('click', function() {
    document.getElementById('passwordChange').style.display = 'block';
    this.style.display = 'none';
  });

  document.getElementById('savePassword')?.addEventListener('click', function() {
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmNewPassword').value;
    
    if (!newPass || !confirmPass) {
      showStatus('Please fill both password fields', 'error');
      return;
    }
    
    if (newPass !== confirmPass) {
      showStatus('Passwords do not match', 'error');
      return;
    }
    
    if (newPass.length < 6) {
      showStatus('Password must be at least 6 characters', 'error');
      return;
    }
    
    activeUser.password = newPass;
    updateUserData();
    
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    document.getElementById('passwordChange').style.display = 'none';
    document.getElementById('editPassword').style.display = 'inline-block';
    showStatus('Password updated successfully', 'success');
  });

  document.getElementById('cancelPassword')?.addEventListener('click', function() {
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    document.getElementById('passwordChange').style.display = 'none';
    document.getElementById('editPassword').style.display = 'inline-block';
  });

  function updateUserData() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.map(user => 
      user.phoneNumber === activeUser.phoneNumber ? activeUser : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('activeUser', JSON.stringify(activeUser));
  }

  function showStatus(message, type) {
    const status = document.getElementById('updateStatus');
    status.textContent = message;
    status.className = `status-message ${type}`;
    setTimeout(() => {
      status.textContent = '';
      status.className = 'status-message';
    }, 3000);
  }
}

// Help Form Functionality
function setupHelpForm() {
  const helpForm = document.getElementById('helpForm');
  if (!helpForm) return;

  helpForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const subject = document.getElementById('helpSubject').value;
    const message = document.getElementById('helpMessage').value.trim();
    const email = document.getElementById('helpEmail').value.trim();
    const statusElement = document.getElementById('helpFormStatus');

    if (!subject || !message) {
      statusElement.textContent = "Please fill in all required fields";
      statusElement.className = "status-message error";
      return;
    }

    // In a real app, you would send this to your backend
    // For now, we'll store it in localStorage
    const helpRequest = {
      id: 'help-' + Date.now(),
      subject,
      message,
      email,
      date: new Date().toISOString(),
      status: 'submitted'
    };

    // Save to localStorage
    const helpRequests = JSON.parse(localStorage.getItem('helpRequests')) || [];
    helpRequests.push(helpRequest);
    localStorage.setItem('helpRequests', JSON.stringify(helpRequests));

    // Show success message
    statusElement.textContent = "Your request has been submitted successfully!";
    statusElement.className = "status-message success";
    
    // Reset form
    helpForm.reset();
    
    // Clear message after 5 seconds
    setTimeout(() => {
      statusElement.textContent = "";
      statusElement.className = "status-message";
    }, 5000);
  });
}

// Signup Functionality
function setupSignupForm() {
  const signupForm = document.getElementById('signupForm');
  if (!signupForm) return;

  signupForm.addEventListener('submit', function(e) {
    e.preventDefault();
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

// Login Functionality
function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const phone = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.phoneNumber === phone && u.password === password);
    if (!user) return alert('Invalid phone number or password.');
    localStorage.setItem('activeUser', JSON.stringify(user));
    window.location.href = 'index.html';
  });
}

// Jobs Listing Functionality
function renderJobsList() {
  const jobsContainer = document.getElementById('jobsContainer');
  if (!jobsContainer) return;

  const jobs = JSON.parse(localStorage.getItem('jobList')) || [];
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  const now = Date.now();

  const availableJobs = jobs.filter(job => {
    if (!job || typeof job !== 'object') return false;
    const isValidJob = job.status && job.expiresAt && job.posterPhone;
    if (!isValidJob) return false;
    return job.status === 'open' && 
           job.expiresAt > now &&
           (!activeUser || job.posterPhone !== activeUser.phoneNumber);
  });

  if (availableJobs.length === 0) {
    jobsContainer.innerHTML = `
      <div class="no-jobs">
        <p>No available jobs matching your criteria.</p>
        ${activeUser ? `<a href="post.html" class="button">Post a Job</a>` : ''}
      </div>
    `;
  } else {
    jobsContainer.innerHTML = availableJobs.map(job => `
      <div class="job-card">
        <h3>${job.title || 'Untitled Job'}</h3>
        <div class="job-meta">
          <span>Posted by: ${job.posterName || 'Unknown'}</span>
          <span>Expires: ${new Date(job.expiresAt).toLocaleDateString()}</span>
        </div>
        <p class="job-description">${job.description || 'No description provided.'}</p>
        <div class="job-actions">
          <a href="job.html?id=${job.id}" class="button">View Details</a>
        </div>
      </div>
    `).join('');
  }
}

// Job Details Functionality
function initializeJobPage() {
  const container = document.getElementById('jobDetailsContainer');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('id');
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  const jobs = JSON.parse(localStorage.getItem('jobList')) || [];
  const job = jobs.find(j => j.id === jobId);

  if (!job) {
    container.innerHTML = '<p class="error">Job not found.</p>';
    return;
  }

  container.innerHTML = `
    <h1>${job.title}</h1>
    <div class="job-meta">
      <span>Posted by: ${job.posterName}</span>
      <span>Expires: ${new Date(job.expiresAt).toLocaleDateString()}</span>
    </div>
    <div class="job-description">
      <h3>Description</h3>
      <p>${job.description}</p>
    </div>
    <div class="job-info">
      <p><strong>Type:</strong> ${job.jobType === 'closed' ? 'Limited' : 'Unlimited'} claims</p>
      <p><strong>Duration:</strong> ${job.duration} days</p>
      ${job.jobType === 'closed' ? `<p><strong>Budget:</strong> UGX ${job.budget} ${job.negotiable ? '(Negotiable)' : ''}</p>` : ''}
    </div>
    <div class="action-buttons">
      <button id="claimJobBtn">Claim This Task</button>
      <button id="shareJobBtn">Share Task</button>
    </div>
  `;

  document.getElementById('claimJobBtn')?.addEventListener('click', () => {
    if (!activeUser) {
      if (confirm('You need to register to claim tasks. Go to sign up page?')) {
        window.location.href = 'signup.html?redirect=' + encodeURIComponent(window.location.href);
      }
      return;
    }
    claimJob(jobId);
  });

  document.getElementById('shareJobBtn')?.addEventListener('click', () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${jobId}`;
    const shareText = `Check out this task on Yamba: ${job.title}\n\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  });
}

function claimJob(jobId) {
  const jobs = JSON.parse(localStorage.getItem('jobList')) || [];
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  const jobIndex = jobs.findIndex(j => j.id === jobId);

  if (jobIndex === -1) return;

  if (jobs[jobIndex].claimedBy.includes(activeUser.phoneNumber)) {
    alert('You have already claimed this task.');
    return;
  }

  jobs[jobIndex].claimedBy.push(activeUser.phoneNumber);
  localStorage.setItem('jobList', JSON.stringify(jobs));
  showPosterContact(jobs[jobIndex]);
}

function showPosterContact(job) {
  const container = document.getElementById('jobDetailsContainer');
  const activeUser = JSON.parse(localStorage.getItem('activeUser'));

  container.innerHTML += `
    <div class="poster-contact">
      <h3>Contact the Poster</h3>
      <p><strong>Name:</strong> ${job.posterName}</p>
      <p><strong>Phone:</strong> <a href="tel:${job.posterPhone}">${job.posterPhone}</a></p>
      <div class="task-status-actions">
        <button id="completeTaskBtn">Mark as Completed</button>
        <button id="cancelTaskBtn">Cancel Task</button>
      </div>
    </div>
  `;

  document.getElementById('completeTaskBtn').addEventListener('click', () => {
    updateTaskStatus(job.id, 'completed', activeUser.phoneNumber);
  });

  document.getElementById('cancelTaskBtn').addEventListener('click', () => {
    updateTaskStatus(job.id, 'cancelled', activeUser.phoneNumber);
  });
}

function updateTaskStatus(jobId, status, userPhone) {
  const jobs = JSON.parse(localStorage.getItem('jobList')) || [];
  const jobIndex = jobs.findIndex(j => j.id === jobId);

  if (jobIndex === -1) return;

  jobs[jobIndex].status = status;
  jobs[jobIndex].completedBy = jobs[jobIndex].completedBy || [];
  
  if (status === 'completed') {
    jobs[jobIndex].completedBy.push({
      phone: userPhone,
      date: new Date().getTime()
    });
  }

  localStorage.setItem('jobList', JSON.stringify(jobs));
  alert(`Task marked as ${status}.`);
  window.location.href = 'my-tasks.html';
}

// My Jobs Page Functionality
function setupMyJobsPage() {
  const myJobsContainer = document.getElementById('myJobsContainer');
  if (!myJobsContainer) return;

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

// Subscription Page Functionality
function setupSubscriptionPage() {
  const subscriptionForm = document.getElementById('subscriptionForm');
  const subscriptionStatus = document.getElementById('subscriptionStatus');
  if (!subscriptionForm || !subscriptionStatus) return;

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

// Mobile Menu Toggle
function toggleMenu() {
  const mobileNav = document.getElementById('mobileNav');
  const hamburger = document.querySelector('.hamburger');
  
  if (!mobileNav || !hamburger) {
    console.error("Mobile menu elements not found!");
    return;
  }

  // Toggle the menu
  mobileNav.classList.toggle('open');
  
  // Update hamburger icon
  hamburger.textContent = mobileNav.classList.contains('open') ? '✖' : '☰';
  
  // Update aria-expanded for accessibility
  hamburger.setAttribute('aria-expanded', mobileNav.classList.contains('open'));
}

// Mobile Logout Handler
function setupMobileLogout() {
  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('activeUser');
      window.location.href = 'login.html';
    });
  }
}

// Window Resize Handler
window.addEventListener('resize', () => {
  const mobileNav = document.getElementById('mobileNav');
  const hamburger = document.querySelector('.hamburger');
  if (window.innerWidth > 600) {
    mobileNav?.classList.remove('open');
    if (hamburger) hamburger.textContent = '☰';
  }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  debugStorage();
  setupAccountNavigation();
  setupLoginForm();
  setupLogoutHandlers();
  setupWelcomeMessage();
  
  setupSignupForm();
  setupPostJobForm();
  initializeAccountPage();
  renderJobsList();
  initializeJobPage();
  setupMyJobsPage();
  setupSubscriptionPage();
  setupHelpForm(); 
  setupMobileLogout(); 
});

// Logout Handlers
function setupLogoutHandlers() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('activeUser');
      alert('Logged out successfully.');
      window.location.href = 'login.html';
    });
  }

  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', () => {
      localStorage.removeItem('activeUser');
      alert('Logged out successfully.');
      window.location.href = 'login.html';
    });
  }
}

function setupWelcomeMessage() {
  const welcomeMsg = document.getElementById('welcomeMsg');
  if (!welcomeMsg) return;

  const activeUser = JSON.parse(localStorage.getItem('activeUser'));
  if (activeUser) {
    welcomeMsg.textContent = `Hello, ${activeUser.fullName}!`;
  } else if (!window.location.pathname.endsWith('login.html')) {
    welcomeMsg.textContent = 'Welcome! Please login.';
  }
}