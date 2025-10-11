<template>
  <div class="profile-view">
    <div class="profile-container">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Profile Header -->
        <div class="profile-header card">
          <div class="profile-info">
            <img src="https://i.pravatar.cc/100" alt="Profile Picture" class="profile-picture">
            <div class="profile-text">
              <h2>Jane Doe</h2>
              <p class="muted-text">Organized shopper since 2024</p>
              <p class="small-text muted-text">jane.doe@example.com</p>
            </div>
          </div>
          <button class="edit-profile-btn" @click="goToSettings">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
              <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
              <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.902 3.433 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.892 3.433-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.892-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.291a1.873 1.873 0 0 0 1.115 2.694l.319.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.292c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.694 1.115l-.094.319c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.693-1.115l-.291.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.291.159A1.873 1.873 0 0 0 6.166 1.626l.094-.319z"/>
            </svg>
            Edit Profile
          </button>
        </div>

        <!-- Shopping Overview -->
        <div class="shopping-overview">
          <div class="overview-card card">
            <div class="overview-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-list-ul" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
              </svg>
            </div>
            <h3>12</h3>
            <p>Active Lists</p>
            <p class="caption muted-text">+2 this week</p>
          </div>
          <div class="overview-card card">
            <div class="overview-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-cart3" viewBox="0 0 16 16">
                <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .49.598l-1 5a.5.5 0 0 1-.465.401l-9.397.472L4.415 11H13a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l.84 4.479 9.144-.459L13.89 4H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
            </div>
            <h3>347</h3>
            <p>Items Purchased</p>
            <p class="caption muted-text">+23 this month</p>
          </div>
          <div class="overview-card card">
            <div class="overview-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-shop" viewBox="0 0 16 16">
                <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976l2.61-3.045zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0zM1.5 8.5A.5.5 0 0 1 2 9v6h12V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5zM4 15h3v-5H4v5zm5-5v5h3V10H9zm-4-1h3v.5a.5.5 0 0 1-1 0V9H4v1z"/>
              </svg>
            </div>
            <h3>8</h3>
            <p>Favorite Stores</p>
            <p class="caption muted-text">Most visited: Whole Foods</p>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="recent-activity">
          <h3>Recent Activity</h3>
          <div class="activity-list">
            <div class="activity-item card">
              <p>Weekly Groceries</p>
              <div class="activity-details">
                <span class="badge completed">Completed</span>
                <span class="muted-text">24 items</span>
                <span class="muted-text">2 hours ago</span>
              </div>
            </div>
            <div class="activity-item card">
              <p>Holiday Dinner</p>
              <div class="activity-details">
                <span class="badge active">Active</span>
                <span class="muted-text">18 items</span>
                <span class="muted-text">5 hours ago</span>
              </div>
            </div>
            <div class="activity-item card">
              <p>Pantry Restock</p>
              <div class="activity-details">
                <span class="badge completed">Completed</span>
                <span class="muted-text">12 items</span>
                <span class="muted-text">1 day ago</span>
              </div>
            </div>
            <div class="activity-item card">
              <p>Meal Prep Sunday</p>
              <div class="activity-details">
                <span class="badge active">Active</span>
                <span class="muted-text">15 items</span>
                <span class="muted-text">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Notifications -->
        <div class="notifications card">
          <h3>Notifications</h3>
          <div class="notification-item">
            <label for="email-notifications">Email Notifications</label>
            <label class="switch">
              <input type="checkbox" id="email-notifications" checked>
              <span class="slider round"></span>
            </label>
          </div>
          <div class="notification-item">
            <label for="push-notifications">Push Notifications</label>
            <label class="switch">
              <input type="checkbox" id="push-notifications" checked>
              <span class="slider round"></span>
            </label>
          </div>
          <div class="notification-item">
            <label for="price-alerts">Price Alerts</label>
            <label class="switch">
              <input type="checkbox" id="price-alerts">
              <span class="slider round"></span>
            </label>
          </div>
        </div>

        <!-- Dietary Preferences -->
        <div class="dietary-preferences card">
          <h3>Dietary Preferences</h3>
          <div class="preferences-tags">
            <span class="tag">Organic</span>
            <span class="tag">Gluten-Free</span>
            <span class="tag">Dairy-Free</span>
            <span class="tag">Local Produce</span>
            <button class="add-btn">+</button>
          </div>
        </div>

        <!-- Favorite Stores -->
        <div class="favorite-stores card">
          <h3>Favorite Stores</h3>
          <div class="stores-list">
            <div class="store-item">Whole Foods Market</div>
            <div class="store-item">Trader Joe's</div>
            <div class="store-item">Safeway</div>
            <div class="store-item">Target</div>
            <button class="add-btn">+</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'ProfileView',
  setup() {
    const router = useRouter()

    const goToSettings = () => {
      router.push('/settings')
    }

    return { goToSettings }
  }
}
</script>

<style scoped>
/* Using styles from src/assets/styles.css */
.profile-view {
  background-color: #1C1C30;
  color: #EDEAF6;
  padding: 2rem;
  font-family: 'Roboto', sans-serif;
}

.profile-container {
  display: flex;
  gap: 2rem;
}

.left-column {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card {
  background-color: #322D59;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.muted-text {
  color: #BDB7E3;
}

.small-text {
  font-size: 0.875rem;
}

/* Profile Header */
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-picture {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #8B7CFF;
}

.profile-text h2 {
  margin: 0;
  font-weight: bold;
}

.profile-text p {
  margin: 0.25rem 0 0;
}

.edit-profile-btn {
  background-color: #8B7CFF;
  color: #EDEAF6;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
}

.edit-profile-btn:hover {
  background-color: #7a6ad9;
}

/* Shopping Overview */
.shopping-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.overview-card {
  text-align: center;
}

.overview-icon {
  color: #8B7CFF;
  margin-bottom: 1rem;
}

.overview-card h3 {
  margin: 0;
  font-size: 2rem;
}

.overview-card p {
  margin: 0.25rem 0 0;
}

.overview-card .caption {
  font-size: 0.875rem;
}

/* Recent Activity */
.recent-activity h3 {
  margin-bottom: 1rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
}

.activity-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.badge.completed {
  background-color: #4CAF50;
  color: white;
}

.badge.active {
  background-color: #FFC107;
  color: #1C1C30;
}

/* Notifications */
.notifications h3,
.dietary-preferences h3,
.favorite-stores h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.notification-item:last-child {
  margin-bottom: 0;
}

/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #4A4472;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #8B7CFF;
}

input:focus + .slider {
  box-shadow: 0 0 1px #8B7CFF;
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Dietary Preferences */
.preferences-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tag {
  background-color: rgba(139, 124, 255, 0.2);
  color: #BDB7E3;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  font-size: 0.875rem;
}

.add-btn {
  background-color: #4A4472;
  color: #EDEAF6;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background-color: #5f589c;
}

/* Favorite Stores */
.stores-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.store-item {
  background-color: #4A4472;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
}

.favorite-stores .add-btn {
    align-self: flex-start;
    margin-top: 0.5rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .profile-container {
    flex-direction: column;
  }
  .shopping-overview {
    grid-template-columns: 1fr;
  }
}
</style>
