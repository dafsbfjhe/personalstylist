import React, { useState, useRef } from 'react';
import { Camera, Ruler, Weight, Sparkles, Upload } from 'lucide-react';
import './App.css';

function App() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ photo, height, weight });
    alert('Style analysis coming soon!');
  };

  return (
    <div className="app-container">
      <div className="noise-overlay"></div>
      
      <main className="main-content">
        <header className="hero-section">
          <div className="badge">AI Personal Stylist</div>
          <h1 className="title">Your Perfect Look <br/><span>Starts Here</span></h1>
          <p className="subtitle">Upload your photo and details to receive personalized styling recommendations tailored just for you.</p>
        </header>

        <form onSubmit={handleSubmit} className="profile-card">
          <div className="photo-upload-section">
            <div 
              className={`photo-preview-container ${!photo ? 'empty' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {photo ? (
                <img src={photo} alt="Preview" className="photo-preview" />
              ) : (
                <div className="upload-placeholder">
                  <div className="icon-circle">
                    <Camera size={32} />
                  </div>
                  <span>Tap to upload your photo</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          <div className="input-group-row">
            <div className="input-field">
              <label><Ruler size={18} /> Height (cm)</label>
              <input 
                type="number" 
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
              />
            </div>
            <div className="input-field">
              <label><Weight size={18} /> Weight (kg)</label>
              <input 
                type="number" 
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="cta-button">
            <Sparkles size={20} />
            <span>Generate My Style</span>
          </button>
        </form>
      </main>

      <footer className="app-footer">
        Powered by AI Fashion Engine
      </footer>
    </div>
  );
}

export default App;
