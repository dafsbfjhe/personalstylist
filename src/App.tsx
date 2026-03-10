import React, { useState, useRef } from 'react';
import { Camera, Ruler, Weight, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import './App.css';

function App() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return alert('Please upload a photo first!');

    setLoading(true);
    setReport(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: photo, height, weight }),
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        setReport(data.choices[0].message.content);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to the style analysis engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="noise-overlay"></div>
      
      <main className="main-content">
        {!report ? (
          <>
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

              <button type="submit" className="cta-button" disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Sparkles size={20} />
                )}
                <span>{loading ? 'Analyzing Your Style...' : 'Generate My Style'}</span>
              </button>
            </form>
          </>
        ) : (
          <div className="report-container">
            <header className="report-header">
              <CheckCircle size={48} className="success-icon" />
              <h2 className="report-title">Analysis Complete</h2>
              <p>Here is your personalized style guide</p>
            </header>
            
            <div className="report-content">
              {report.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            
            <button onClick={() => setReport(null)} className="secondary-button">
              Start New Analysis
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        Powered by AI Fashion Engine & OpenAI
      </footer>
    </div>
  );
}

export default App;
