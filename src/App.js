import React from "react";
import "./index.css";

export default function AppLayout() {
  return (
    <div className="app-root">
      <header className="topbar">
        <div className="title">Projeto MARE</div>
        <div className="actions">
          <div className="subtitle">Funchal Bay 2022</div>
          <button className="btn">Upload</button>
        </div>
      </header>

      <div className="content-wrapper">

        <nav className="left-controls-vertical">
          <div className="ctrl-section">
            <div className="section-label">Select / Edit</div>
            <div className="ctrl-column">
              <button className="icon-btn" title="Box Select">
                <img src="/img/box_select1.png" alt="box select" />
              </button>
              <button className="icon-btn" title="Text Box">
                <img src="/img/text-box1.png" alt="text box" />
              </button>
              <button className="icon-btn" title="Draw">
                <img src="/img/draw1.png" alt="draw" />
              </button>
            </div>
          </div>

          <div className="divider" />

          <div className="ctrl-section">
            <div className="section-label">Info / View</div>
            <div className="ctrl-column">
              <button className="icon-btn" title="Info">
                <img src="/img/info1.png" alt="info" />
              </button>
              <button className="icon-btn" title="Change View">
                <img src="/img/view1.png" alt="view" />
              </button>
            </div>
          </div>

          <div className="divider" />

          <div className="ctrl-section">
            <div className="section-label">Utilities</div>
            <div className="ctrl-column">
              <button className="icon-btn" title="Upload">
                <img src="/img/scroll1.png" alt="upload" />
              </button>
              <button className="icon-btn" title="Screenshot">
                <img src="/img/print1.png" alt="screenshot" />
              </button>
              <button className="icon-btn" title="Time / Paginate">
                <img src="/img/clock_plus1.png" alt="time" />
              </button>
            </div>
          </div>

          <div className="divider" />

          <div className="ctrl-section">
            <div className="section-label">Audio / AI</div>
            <div className="ctrl-column">
              <button className="icon-btn" title="Mute">
                <img src="/img/mute1.png" alt="mute" />
              </button>
              <button className="icon-btn" title="Speed">
                <img src="/img/speedometer1.png" alt="speed" />
              </button>
              <button className="icon-btn" title="+10s">
                <img src="/img/forward1.png" alt="forward" />
              </button>
              <button className="icon-btn" title="Run AI">
                <img src="/img/ai1.png" alt="ai" />
              </button>
            </div>
          </div>
        </nav>


        <aside className="tag-sidebar">
          <div className="panel block">
            <div className="panel-title">Objects</div>
            <div className="item-list">
              <div className="item">dolphin</div>
              <div className="item">whale</div>
              <div className="item">seal</div>
              <div className="item">turtle</div>
            </div>
          </div>
          <div className="panel block">
            <div className="panel-title">Events</div>
            <div className="item-list">
              <div className="item">noise</div>
              <div className="item">nothing</div>
            </div>
          </div>
          <div className="panel block">
            <div className="panel-title">Tags</div>
            <div className="item-list">
              <div className="item tag">example-tag-1</div>
              <div className="item tag">example-tag-2</div>
            </div>
          </div>
        </aside>

        <main className="main-area">
          <section className="viewer">
            <div className="viewer-header">
              <div className="badge">Waveform / Visualization placeholder</div>
            </div>
            <div className="viewer-box">
              <div className="placeholder">
                <div className="spectrogram-scroll">
                  <img
                    src="/path/to/your/screenshot.png"
                    alt="placeholder"
                    className="placeholder-img"
                  />
                  <div className="overlay-label">
                    Waveform / Visualization placeholder
                  </div>
                </div>
              </div>
              <div className="playback">
                <div className="controls">
                  <button className="icon-btn" title="+10s">
                    <img src="/img/previous1.png" alt="forward" />
                  </button>
                  <button className="icon-btn" title="+10s">
                    <img src="/img/play1.png" alt="forward" />
                  </button>
                  <button className="icon-btn" title="+10s">
                    <img src="/img/next-button1.png" alt="forward" />
                  </button>
                </div>
                <div className="progress-wrapper">
                  <div className="scroll-bar-container">
                    <div className="scroll-bar">
                      <div className="scroll-thumb" style={{ width: '20%', left: '0%' }}></div>
                    </div>
                  </div>

                  <div className="progress-bar">
                    <div className="progress-filled" style={{ width: '40%' }}></div>
                  </div>

                  <div className="time">00:12 / 03:45</div>
                </div>

              </div>
            </div>
          </section>

          <section className="bottom">
            <div className="bottom-grid">
              <div className="annotations">
                <div className="panel-header">
                  <div className="panel-title">Annotations</div>
                  <div className="panel-meta">Filter / Search</div>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Begin (s)</th>
                        <th>End (s)</th>
                        <th>High Freq (Hz)</th>
                        <th>Low Freq (Hz)</th>
                        <th>Class</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>5.0434</td>
                        <td>6.6921</td>
                        <td>7252</td>
                        <td>2286</td>
                        <td>dolphin</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>5.0434</td>
                        <td>6.6921</td>
                        <td>7252</td>
                        <td>2286</td>
                        <td>whale</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="files-panel">
                <div className="panel-header">
                  <div className="panel-title">Files</div>
                </div>
                <ul className="file-list">
                  <li className="file-item">
                    <div className="file-name">
                      sound 8 - 2022-06-05_15_26_AMP.wav
                    </div>
                    <div className="file-actions">
                      <button className="small-btn">▶️</button>
                      <button className="small-btn">⬇️</button>
                    </div>
                  </li>
                  <li className="file-item">
                    <div className="file-name">
                      sound 7 - 2022-06-05_15_26_AMP.wav
                    </div>
                    <div className="file-actions">
                      <button className="small-btn">▶️</button>
                      <button className="small-btn">⬇️</button>
                    </div>
                  </li>
                </ul>
                <div className="add-file">
                  <button className="btn full">Add File</button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
