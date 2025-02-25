interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-svh flex items-center justify-center">
            {children}
        </div>
    );
}
 
export default Layout;