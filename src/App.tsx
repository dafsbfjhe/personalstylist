import React, { useState, useRef } from 'react';
import { Camera, Ruler, Weight, Sparkles, Loader2, CheckCircle, ArrowLeft, Download, UploadCloud } from 'lucide-react';
import './App.css';

function App() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('이미지 파일만 업로드 가능합니다.');
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
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
              <div className="badge">AI Personal Stylist</div>
              <h1 className="title">당신의 스타일을 <br/><span>새롭게 정의하다</span></h1>
              <p className="subtitle">AI가 당신의 사진과 체형을 정밀 분석하여 <br/>최상의 스타일링 리포트를 선사합니다.</p>
            </header>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <div className="photo-upload-section">
                <div 
                  className={`photo-preview-container ${isDragging ? 'dragging' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {photo ? (
                    <img src={photo} alt="Preview" className="photo-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <div className="icon-circle">
                        {isDragging ? <UploadCloud size={32} /> : <Camera size={32} />}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {isDragging ? '여기에 놓으세요' : '사진을 끌어오거나 클릭'}
                      </span>
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
                  <label><Ruler size={18} /> 키 (cm)</label>
                  <input 
                    type="number" 
                    placeholder="175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    required
                  />
                </div>
                <div className="input-field">
                  <label><Weight size={18} /> 몸무게 (kg)</label>
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
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <Sparkles size={24} />
                )}
                <span>{loading ? '스타일 분석 중...' : '나만의 스타일을 만들어보세요!'}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="report-container">
            <header className="report-header" style={{ marginBottom: '32px' }}>
              <div className="success-badge">
                <CheckCircle size={20} />
                <span>스타일 분석 완료</span>
              </div>
              <h2 className="title" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>퍼스널 스타일 가이드</h2>
              <p className="subtitle">AI가 제안하는 당신을 위한 최적의 코디입니다.</p>
            </header>
            
            <div className="report-card">
              <div className="report-content">
                {report.split('\n').map((line, i) => (
                  <p key={i} style={{ marginBottom: '10px' }}>{line || '\u00A0'}</p>
                ))}
              </div>
            </div>
            
            <div className="action-buttons">
              <button onClick={() => setReport(null)} className="secondary-button">
                <ArrowLeft size={20} />
                다시 하기
              </button>
              <button onClick={() => window.print()} className="primary-outline-button">
                <Download size={20} />
                저장하기
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer" style={{ marginTop: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', zIndex: 1, position: 'relative' }}>
        Powered by AI Fashion Engine & OpenAI
      </footer>
    </div>
  );
}

export default App;
