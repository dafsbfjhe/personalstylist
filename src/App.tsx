import React, { useState, useRef } from 'react';
import { Camera, Ruler, Weight, Sparkles, Loader2, CheckCircle, ArrowLeft, Download } from 'lucide-react';
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
    if (!photo) return alert('먼저 사진을 업로드해주세요!');

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
        console.error('API Error:', data.error);
        alert(`분석 중 오류 발생: ${data.error}`);
      }
    } catch (error) {
      console.error('Connection Error:', error);
      alert('스타일 분석 엔진에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <main className="main-content">
        {!report ? (
          <div className="profile-card">
            <header className="hero-section">
              <h1 className="title">나만의 스타일 <br/><span>지금 찾기</span></h1>
              <p className="subtitle">체형과 이미지에 맞는 최적의 스타일링을 <br/>AI 스타일리스트가 제안해 드립니다.</p>
            </header>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
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
                        <Camera size={28} />
                      </div>
                      <span>사진 업로드</span>
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
                  <label><Ruler size={16} /> 키 (cm)</label>
                  <input 
                    type="number" 
                    placeholder="175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    required
                  />
                </div>
                <div className="input-field">
                  <label><Weight size={16} /> 몸무게 (kg)</label>
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
                <span>{loading ? '스타일 분석 중...' : '나만의 스타일을 만들어보세요!'}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="report-container">
            <header className="report-header" style={{ marginBottom: '24px' }}>
              <div className="success-badge" style={{ marginBottom: '12px' }}>
                <CheckCircle size={18} />
                <span>분석 완료</span>
              </div>
              <h2 className="report-title" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>스타일 분석 결과</h2>
              <p className="report-subtitle">AI 퍼스널 스타일 가이드</p>
            </header>
            
            <div className="report-card">
              <div className="report-content">
                {report.split('\n').map((line, i) => (
                  <p key={i} style={{ marginBottom: '8px' }}>{line || '\u00A0'}</p>
                ))}
              </div>
            </div>
            
            <div className="action-buttons">
              <button onClick={() => setReport(null)} className="secondary-button">
                <ArrowLeft size={18} />
                다시 하기
              </button>
              <button onClick={() => window.print()} className="primary-outline-button">
                <Download size={18} />
                저장하기
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer" style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Powered by AI Fashion Engine & OpenAI
      </footer>
    </div>
  );
}

export default App;
