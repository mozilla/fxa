import Image from 'next/image';
import mozLogo from '../../images/moz-logo-bw-rgb.svg';

const Footer = () => {
  return (
    <footer
      className="py-4 mx-4 flex-wrap mobileLandscape:flex-nowrap mobileLandscape:mx-8 mobileLandscape:pb-6 flex border-t border-grey-100 text-grey-400"
      data-testid="footer"
    >
      <a href="https://www.mozilla.org/about/?utm_source=firefox-accounts&utm_medium=Referral">
        <Image
          src={mozLogo}
          alt="Mozilla logo"
          className="transition-standard w-18 h-auto opacity-75 hover:opacity-100"
          width={72}
          height={20}
        />
      </a>
      <div className="w-full mobileLandscape:w-auto flex items-center mt-3 mobileLandscape:mt-0 mobileLandscape:ml-10">
        <a
          href="https://www.mozilla.org/en-US/privacy/websites/"
          className="transition-standard text-xs hover:text-grey-500 hover:underline mobileLandscape:self-end"
        >
          Website Privacy Notice
        </a>
      </div>
      <div className="w-full mobileLandscape:w-auto flex items-center mt-3 mobileLandscape:mt-0 mobileLandscape:ml-10">
        <a
          href="https://www.mozilla.org/en-US/about/legal/terms/services/"
          className="transition-standard text-xs mobileLandscape:self-end hover:text-grey-500 hover:underline"
        >
          Terms of Service
        </a>
      </div>
    </footer>
  );
};

export default Footer;
