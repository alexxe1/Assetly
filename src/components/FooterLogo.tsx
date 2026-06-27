'use client'

import Image from 'next/image'

export default function FooterLogo() {
    return (
        <footer style={{
            position: 'fixed',
            bottom: '16px',
            left: '16px',
            zIndex: 50,
        }}>
            <a
                href="https://github.com/alexxe1"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Image
                    src="/logo.png"
                    alt="alexxe1"
                    width={36}
                    height={36}
                    style={{ borderRadius: '50%', opacity: 0.7, transition: 'opacity 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                />
            </a>
        </footer>
    )
}