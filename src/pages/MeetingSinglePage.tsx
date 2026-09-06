import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, isConfigured } from '../lib/supabase';
import { Meeting, Project } from '../types';
import { initialMeetings, initialProjects } from '../mock/seedData';
import { Calendar, User, Paperclip, CheckCircle2, Circle, ArrowLeft, Share2, Check, ExternalLink, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const MeetingSinglePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    async function loadMeeting() {
      if (!id) return;
      setIsLoading(true);

      if (!isConfigured) {
        // Local fallback
        const savedMeetings = localStorage.getItem('sot_meetings');
        const meetingsList: Meeting[] = savedMeetings ? JSON.parse(savedMeetings) : initialMeetings;
        const found = meetingsList.find(m => m.id === id);
        if (found) {
          setMeeting(found);
          const savedProjects = localStorage.getItem('sot_projects');
          const projectsList: Project[] = savedProjects ? JSON.parse(savedProjects) : initialProjects;
          if (found.project_id) {
            setProject(projectsList.find(p => p.id === found.project_id) || null);
          }
        }
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('meetings')
          .select('*, project:projects(*)')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching meeting:', error);
        } else if (data) {
          setMeeting(data);
          if (data.project) {
            setProject(data.project);
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMeeting();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <div style={{ width: '8px', height: '8px', background: 'var(--accent)' }} />
          Loading Minutes of Meeting...
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Meeting Record Not Found</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>The requested meeting minutes may have been removed or does not exist.</p>
        <Link to="/meetings" className="btn btn-primary">&larr; Return to Meeting Index</Link>
      </div>
    );
  }

  return (
    <div className="sot-meeting-page-wrapper" style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '24px 16px' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Top Navbar / Actions (Hidden on Print) */}
        <div className="sot-meeting-actions-bar sot-no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <Link to="/meetings" className="btn btn-sm btn-ghost" style={{ gap: '6px' }}>
            <ArrowLeft size={14} /> Back to Archive
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleShare}
              className="btn btn-sm btn-primary"
              title="Copy shareable link"
              style={{ gap: '6px' }}
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-sm btn-ghost"
              title="Print document or Save as PDF"
              style={{ gap: '6px' }}
            >
              <Download size={14} /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Main Document Card (The only part that prints cleanly) */}
        <div className="card sot-meeting-printable-doc" style={{ padding: '36px 32px', boxShadow: 'var(--shadow-modal)' }}>
          
          {/* Document Header */}
          <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', background: 'var(--accent)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                  Streets of Tripura Archive
                </span>
              </div>
              <span className="badge badge-red" style={{ fontSize: '11px', padding: '3px 8px' }}>
                Official Minutes
              </span>
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', marginTop: '6px' }}>
              {meeting.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} style={{ color: 'var(--accent)' }} />
                <strong>Date:</strong> {meeting.date}
              </span>
              {project && (
                <span>
                  <strong>Project:</strong> <Link to={`/projects/${project.id}`} style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>{project.name}</Link>
                </span>
              )}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                ID: {meeting.id}
              </span>
            </div>
          </div>

          {/* Document Content Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Attendees */}
            {meeting.attendees && meeting.attendees.length > 0 && (
              <div>
                <h2 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  1. Attendees
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {meeting.attendees.map((person, idx) => (
                    <span key={idx} className="badge badge-outline" style={{ fontSize: '12px', padding: '4px 10px', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={13} style={{ color: 'var(--accent)' }} /> {person}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Agenda */}
            {meeting.agenda && (
              <div>
                <h2 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  2. Meeting Agenda
                </h2>
                <div style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap', border: '1px solid var(--border-subtle)' }}>
                  {meeting.agenda}
                </div>
              </div>
            )}

            {/* Discussion Notes */}
            {meeting.discussion && (
              <div>
                <h2 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  3. Key Discussion Points
                </h2>
                <div style={{ fontSize: '13.5px', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {meeting.discussion}
                </div>
              </div>
            )}

            {/* Decisions */}
            {meeting.decisions && (
              <div>
                <h2 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  4. Agreed Decisions
                </h2>
                <div style={{ padding: '14px 16px', background: 'var(--sot-red-subtle)', border: '1px solid rgba(161, 0, 0, 0.2)', borderRadius: 'var(--radius-md)', fontSize: '13.5px', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                  {meeting.decisions}
                </div>
              </div>
            )}

            {/* Action Items */}
            {meeting.action_items && meeting.action_items.length > 0 && (
              <div>
                <h2 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  5. Action Items & Next Steps
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {meeting.action_items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.completed ? (
                          <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />
                        ) : (
                          <Circle size={16} style={{ color: 'var(--border-color)' }} />
                        )}
                        <span style={{ fontSize: '13px', textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                          {item.text}
                        </span>
                      </div>
                      {item.assignee && (
                        <span className="badge badge-red" style={{ fontSize: '10px' }}>
                          {item.assignee}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {meeting.attachments && meeting.attachments.length > 0 && (
              <div>
                <h2 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  6. Attachments & Referenced Files
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {meeting.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Paperclip size={14} style={{ color: 'var(--accent)' }} />
                        <span style={{ fontWeight: 500 }}>{att.name}</span>
                      </div>
                      <span className="badge" style={{ fontSize: '10px' }}>{att.type} &rarr;</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Signature */}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Archived in Streets of Tripura Central Records</span>
            <span>Recorded at: {new Date(meeting.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
