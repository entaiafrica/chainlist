import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

function CountdownTimer({ deadline, compact = false }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalHours: 0,
        expired: false
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = Math.floor(Date.now() / 1000);
            const deadlineSeconds = parseInt(deadline);
            const difference = deadlineSeconds - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0, expired: true });
                return;
            }

            const days = Math.floor(difference / (60 * 60 * 24));
            const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
            const minutes = Math.floor((difference % (60 * 60)) / 60);
            const seconds = Math.floor(difference % 60);
            const totalHours = Math.floor(difference / 3600);

            setTimeLeft({ days, hours, minutes, seconds, totalHours, expired: false });
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [deadline]);

    if (timeLeft.expired) {
        return (
            <div className={`text-center ${compact ? 'text-xs px-2 py-1' : 'text-sm p-3'} bg-red-800 text-white font-bold rounded-lg flex items-center justify-center`}>
                <Clock className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                OTP Expired
            </div>
        );
    }

    const isUrgent = timeLeft.totalHours < 24;
    const bgColor = isUrgent ? 'bg-red-600' : 'bg-purple-800';
    const textColor = 'text-white';
    const labelColor = isUrgent ? 'text-red-200' : 'text-purple-200';

    if (compact) {
        return (
            <div className={`${bgColor} ${textColor} rounded-lg flex flex-col items-center justify-center px-2 py-1 min-w-[70px]`}>
                <div className="flex items-baseline gap-1 leading-tight">
                    <span className="font-bold text-sm">{timeLeft.days}d</span>
                    <span className="font-bold text-sm">{timeLeft.hours.toString().padStart(2, '0')}h</span>
                </div>
                <div className="flex items-center gap-1 leading-none opacity-90 mt-0.5">
                    <span className="text-[10px] font-medium">{timeLeft.minutes.toString().padStart(2, '0')}m</span>
                    <span className="text-[10px] font-medium">{timeLeft.seconds.toString().padStart(2, '0')}s</span>
                </div>
            </div>
        );
    }

    // Larger, more prominent display
    return (
        <div className={`${bgColor} rounded-xl p-3 text-center`}>
            <div className="flex items-center justify-center mb-2">
                <Clock className={`w-4 h-4 ${labelColor}`} />
                <span className={`text-xs font-semibold ${labelColor} uppercase tracking-wider ml-1`}>
                    Offer Ends In
                </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
                <div className="flex flex-col items-center">
                    <div className={`text-xl sm:text-2xl font-black ${textColor}`}>{timeLeft.days}</div>
                    <div className={`text-[9px] sm:text-[10px] uppercase ${labelColor}`}>Days</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className={`text-xl sm:text-2xl font-black ${textColor}`}>{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className={`text-[9px] sm:text-[10px] uppercase ${labelColor}`}>Hours</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className={`text-xl sm:text-2xl font-black ${textColor}`}>{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className={`text-[9px] sm:text-[10px] uppercase ${labelColor}`}>Mins</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className={`text-xl sm:text-2xl font-black ${textColor}`}>{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className={`text-[9px] sm:text-[10px] uppercase ${labelColor}`}>Secs</div>
                </div>
            </div>
        </div>
    );
}

export default CountdownTimer;
