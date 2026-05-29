import Logo from './Logo';

const LoadingScreen = ({ message = 'Carregando...' }) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#FDFDFD' }}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="animate-bounce">
          <Logo size={56} />
        </div>
        <div className="w-1 h-1 rounded-full bg-[#FFB347] animate-ping" />
        <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
