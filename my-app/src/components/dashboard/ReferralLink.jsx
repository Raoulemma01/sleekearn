
  const ReferralLink = ({ userId, referralCode }) => {
    const link = `https://sleekearn.com/ref/${referralCode || userId}`;
    
    return (
      <div className="referral-link">
        <p>Your referral link: {link}</p>
        <button onClick={() => navigator.clipboard.writeText(link)}>
          Copy Link
        </button>
      </div>
    );
  };
  
  export default ReferralLink;