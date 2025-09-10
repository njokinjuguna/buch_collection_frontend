export default function SiteFooter(){
  return (
    <footer className="footer">
      <div className="container" style={{display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:16}}>
        <div>© {new Date().getFullYear()} Buch Collections. All rights reserved.</div>
        <div>Call: 07xx xxx xxx • Nairobi, Kenya</div>
      </div>
    </footer>
  );
}
