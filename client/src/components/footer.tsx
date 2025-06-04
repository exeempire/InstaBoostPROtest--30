import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Instagram",
      icon: "fab fa-instagram",
      url: "https://instagram.com/instaboostpro",
      color: "text-pink-500"
    },
    {
      name: "Telegram",
      icon: "fab fa-telegram",
      url: "https://t.me/instaboostpro",
      color: "text-blue-500"
    },
    {
      name: "Twitter",
      icon: "fab fa-twitter",
      url: "https://twitter.com/instaboostpro",
      color: "text-blue-400"
    },
    {
      name: "WhatsApp",
      icon: "fab fa-whatsapp",
      url: "https://wa.me/1234567890",
      color: "text-green-500"
    }
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Wallet", href: "/wallet" },
    { name: "Orders", href: "/orders" },
    { name: "FAQ", href: "/faq" }
  ];

  const supportLinks = [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund Policy", href: "/refund" },
    { name: "Contact Us", href: "/contact" }
  ];

  return (
    <footer className="bg-charcoal-dark border-t border-gold/20 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gold to-tan rounded-lg flex items-center justify-center shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-charcoal">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                  <path d="M19.5 14.5L20.5 17.5L23.5 18.5L20.5 19.5L19.5 22.5L18.5 19.5L15.5 18.5L18.5 17.5L19.5 14.5Z" fill="currentColor"/>
                  <path d="M4.5 1.5L5.5 4.5L8.5 5.5L5.5 6.5L4.5 9.5L3.5 6.5L0.5 5.5L3.5 4.5L4.5 1.5Z" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-gold font-bold text-xl">InstaBoost Pro</span>
            </div>
            <p className="text-cream/70 mb-6 max-w-md">
              Premium SMM panel providing high-quality Instagram services with 24/7 support, 
              instant delivery, and the best prices in the market.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 bg-charcoal border border-gold/20 rounded-lg flex items-center justify-center hover:border-gold transition-colors duration-300 ${social.color} hover:scale-110 transform`}
                  title={social.name}
                >
                  <i className={`${social.icon} text-lg`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gold font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-cream/70 hover:text-gold transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-gold font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-cream/70 hover:text-gold transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="text-cream/70 text-sm mb-2">24/7 Support Available</p>
              <p className="text-gold font-semibold">support@instaboostpro.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gold/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-cream/60 text-sm mb-4 md:mb-0">
              © {currentYear} InstaBoost Pro. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-cream/60">
                <i className="fas fa-shield-alt text-gold mr-2"></i>
                SSL Secured
              </div>
              <div className="text-cream/60">
                <i className="fas fa-clock text-gold mr-2"></i>
                24/7 Service
              </div>
              <div className="text-cream/60">
                <i className="fas fa-award text-gold mr-2"></i>
                Premium Quality
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}