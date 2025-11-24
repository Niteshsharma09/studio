export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">&copy; {new Date().getFullYear()} Shady Emporium. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-sm hover:underline">Privacy Policy</a>
            <a href="#" className="text-sm hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
