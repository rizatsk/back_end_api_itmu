function createProfileImage(initials) {
  initials = initials.split(' ').slice(0, 2).map(word => word.charAt(0)).join('');
  initials = initials.toUpperCase();

  // buat SVG sederhana
  const svg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#0F3D3E" />
      <text x="50%" y="60%" text-anchor="middle" font-size="80" fill="#FFFFFF" style="font-family: Arial;">${initials}</text>
    </svg>
  `;

  // kembalikan URL data
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

module.exports = createProfileImage;