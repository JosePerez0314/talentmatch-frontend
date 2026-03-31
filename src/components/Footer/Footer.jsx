import React from 'react'


export default function Footer() {
  return (
    <footer className="bg-primary py-5 text-white text-[13px] font-medium flex justify-between px-10">
        <p>Copyright {new Date().getFullYear()}</p>
        <p>Contáctanos</p>
        <p>Ayuda</p>
    </footer>
  )
}
