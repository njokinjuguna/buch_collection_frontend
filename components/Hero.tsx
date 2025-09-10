// components/Hero.tsx

type Props = {
  background?: string;    // image url (we’ll pass a banner or first product)
};

export default function Hero({ background }: Props) {
  const style = background
    ? { backgroundImage: `url(${background})` }
    : undefined;

  return (
    <section className="hero">
      <div className="inner" style={style}>
        <div className="overlay" />
        <div className="container" style={{position:"relative", zIndex:2}}>
          <h1>STEP UP YOUR STYLE &<br/> SIMPLIFY YOUR LIFE</h1>
          <p>Discover premium footwear and top-quality appliances in one convenient destination</p>
          <a className="btn" href="#grid">SHOP NOW</a>
        </div>
      </div>
    </section>
  );
}
