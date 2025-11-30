
import { Mail, Phone, ChevronsRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "#" },
    { name: "Contact", href: "#" },
    { name: "Terms & Condition", href: "#" },
  ];

  const topPicks = [
    { name: "Fastrack Frames", href: "/?category=frames" },
    { name: "Single Vision Lens", href: "/?category=lenses" },
    { name: "Progressive Lens", href: "/?category=lenses" },
    { name: "Bifocal Lens", href: "/?category=lenses" },
    { name: "Zero Power Lens", href: "/?category=lenses" },
    { name: "Techno-i", href: "/" },
  ];

  const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href}>
      <span className="flex items-center gap-2 hover:text-accent transition-colors">
        <ChevronsRight className="w-4 h-4" />
        {children}
      </span>
    </Link>
  );

  return (
    <footer style={{ backgroundColor: "hsl(var(--footer-background))", color: "hsl(var(--footer-foreground))" }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo and Description */}
          <div className="space-y-4">
            <Link href="/">
              <Image src="/logo.png" alt="technoii Logo" width={140} height={40} />
            </Link>
            <p className="text-sm text-muted-foreground/80">
              Techno-i is an ophthalmic optics company that designs, manufactures and markets lenses to correct or protect eyesight. It has German lacquer coating with nominal price.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <FooterLink href={link.href}>{link.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Our Top Picks */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Our Top Picks</h3>
            <ul className="space-y-2 text-sm">
              {topPicks.map((pick) => (
                <li key={pick.name}>
                   <FooterLink href={pick.href}>{pick.name}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Help */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Help</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent" />
                <a href="mailto:technoi728@gmail.com" className="hover:text-accent transition-colors">
                  technoi728@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent" />
                <a href="tel:+919399842936" className="hover:text-accent transition-colors">
                  +919399842936
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-background/10 py-4">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} technoii. All rights reserved.</p>
          </div>
      </div>
    </footer>
  );
}
