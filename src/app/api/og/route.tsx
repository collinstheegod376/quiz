import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const player = searchParams.get('player') || 'Challenger';
    const score = searchParams.get('score') || '1,200';
    const topic = searchParams.get('topic') || 'Anime Trivia';
    const grade = searchParams.get('grade') || 'S';
    const accuracy = searchParams.get('accuracy') || '95';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#100F0F',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #2A2929 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1E1D1D 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            color: '#FFFFFF',
            fontFamily: 'sans-serif',
            padding: '50px 60px',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Brand Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#B9843E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '26px',
                  fontWeight: 900,
                  color: '#000000',
                }}
              >
                AZ
              </div>
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 900,
                  letterSpacing: '-1px',
                  color: '#FFFDF4',
                }}
              >
                ANIZUKI
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 20px',
                borderRadius: '9999px',
                backgroundColor: '#2A2929',
                border: '2px solid #363535',
                fontSize: '18px',
                fontWeight: 800,
                color: '#6FEEFF',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Arena Match Result
            </div>
          </div>

          {/* Main Content Area */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              backgroundColor: '#1E1D1D',
              borderRadius: '24px',
              border: '3px solid #363535',
              padding: '40px 50px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxWidth: '650px',
              }}
            >
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#A4A3A3',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
              >
                {topic}
              </span>
              <span
                style={{
                  fontSize: '48px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                }}
              >
                {player}
              </span>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#4CA471',
                }}
              >
                Conquered the match with {accuracy}% accuracy!
              </span>
            </div>

            {/* Score & Grade Display */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#100F0F',
                borderRadius: '20px',
                border: '2px solid #B9843E',
                padding: '24px 36px',
                minWidth: '220px',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#B9843E',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Grade {grade}
              </span>
              <span
                style={{
                  fontSize: '54px',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  lineHeight: 1,
                }}
              >
                {score}
              </span>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#A4A3A3',
                }}
              >
                ARENA XP
              </span>
            </div>
          </div>

          {/* Footer Callout */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              fontSize: '18px',
              fontWeight: 700,
              color: '#A4A3A3',
            }}
          >
            <span>Can you beat this score? Play now at anizuki.sbs</span>
            <span style={{ color: '#6FEEFF' }}>Real-Time Anime Quiz Arena</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response('Failed to generate image', { status: 500 });
  }
}
