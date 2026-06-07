import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <!-- Animated Background -->
      <div class="auth-bg">
        <div class="auth-bg-gradient"></div>
        <div class="auth-bg-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
          <div class="shape shape-4"></div>
        </div>
      </div>

      <!-- Content -->
      <div class="auth-container">
        <!-- Brand Section (Desktop Side) -->
        <div class="auth-brand">
          <div class="brand-content">
            <div class="brand-logo">
              <div class="logo-icon">
                <i class="pi pi-building text-3xl"></i>
              </div>
              <h1 class="logo-text">LiveSpace<span class="logo-accent">Pro</span></h1>
            </div>
            <p class="brand-tagline">Intelligent Property Operations, Reimagined</p>
            <div class="brand-features">
              <div class="feature-item">
                <i class="pi pi-check-circle"></i>
                <span>Multi-property Management</span>
              </div>
              <div class="feature-item">
                <i class="pi pi-check-circle"></i>
                <span>Real-time Occupancy Tracking</span>
              </div>
              <div class="feature-item">
                <i class="pi pi-check-circle"></i>
                <span>Automated Rent Collection</span>
              </div>
              <div class="feature-item">
                <i class="pi pi-check-circle"></i>
                <span>AI-Powered Insights</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Section -->
        <div class="auth-form-section">
          <div class="auth-form-card">
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Animated Gradient Background */
    .auth-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
    }

    .auth-bg-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(-45deg, #1e1b4b, #312e81, #3730a3, #1e293b);
      background-size: 400% 400%;
      animation: authGradient 12s ease infinite;
    }

    @keyframes authGradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* Floating Shapes */
    .auth-bg-shapes {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.08;
      animation: float 20s ease-in-out infinite;
    }

    .shape-1 {
      width: 500px;
      height: 500px;
      background: linear-gradient(135deg, #818CF8, #6366F1);
      top: -100px;
      right: -100px;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 400px;
      height: 400px;
      background: linear-gradient(135deg, #A855F7, #8B5CF6);
      bottom: -80px;
      left: -80px;
      animation-delay: -5s;
      animation-duration: 25s;
    }

    .shape-3 {
      width: 250px;
      height: 250px;
      background: linear-gradient(135deg, #06B6D4, #3B82F6);
      top: 40%;
      left: 30%;
      animation-delay: -10s;
      animation-duration: 18s;
    }

    .shape-4 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #F59E0B, #EF4444);
      bottom: 20%;
      right: 20%;
      animation-delay: -7s;
      animation-duration: 22s;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
      25% { transform: translate(30px, -40px) rotate(5deg) scale(1.05); }
      50% { transform: translate(-20px, 20px) rotate(-3deg) scale(0.95); }
      75% { transform: translate(15px, 30px) rotate(4deg) scale(1.02); }
    }

    /* Container */
    .auth-container {
      position: relative;
      z-index: 1;
      display: flex;
      width: 100%;
      max-width: 1100px;
      min-height: 600px;
      margin: 1rem;
      border-radius: 24px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
    }

    /* Brand Section */
    .auth-brand {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1));
      border-right: 1px solid rgba(255, 255, 255, 0.08);
    }

    .brand-content {
      max-width: 380px;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .logo-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
    }

    .logo-text {
      font-size: 2rem;
      font-weight: 800;
      color: white;
      letter-spacing: -0.02em;
    }

    .logo-accent {
      color: #A5B4FC;
    }

    .brand-tagline {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.65);
      margin-bottom: 2.5rem;
      line-height: 1.5;
    }

    .brand-features {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
    }

    .feature-item i {
      color: #A5B4FC;
      font-size: 1.1rem;
    }

    /* Form Section */
    .auth-form-section {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.03);
    }

    .auth-form-card {
      width: 100%;
      max-width: 420px;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .auth-container {
        flex-direction: column;
        margin: 0;
        min-height: 100vh;
        border-radius: 0;
        border: none;
      }

      .auth-brand {
        padding: 2rem 1.5rem 1.5rem;
        border-right: none;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .brand-features {
        display: none;
      }

      .brand-tagline {
        margin-bottom: 0;
        font-size: 0.95rem;
      }

      .auth-form-section {
        padding: 1.5rem;
        flex: none;
      }
    }
  `]
})
export class AuthLayoutComponent { }
