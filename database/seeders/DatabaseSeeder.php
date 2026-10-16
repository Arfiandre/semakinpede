<?php

namespace Database\Seeders;

use App\Models\Broker;
use App\Models\EconomicNews;
use App\Models\Event;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Superadmin User
        User::updateOrCreate(
            ['username' => 'superadmin'],
            [
                'name' => 'Superadmin Semakin Pede',
                'email' => 'admin@semakinpede.com',
                'password' => Hash::make('Admin123!'),
            ]
        );

        // 2. Default Event
        $competitionPoster = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><defs><linearGradient id='bgGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23060E1B'/><stop offset='60%25' stop-color='%230F2140'/><stop offset='100%25' stop-color='%23060E1B'/></linearGradient><linearGradient id='goldGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23F59E0B'/><stop offset='50%25' stop-color='%23FCD34D'/><stop offset='100%25' stop-color='%23B45309'/></linearGradient></defs><rect width='800' height='450' fill='url(%23bgGrad)'/><circle cx='650' cy='225' r='180' fill='%23D4AF37' fill-opacity='0.08'/><path d='M60 340 L180 270 L280 290 L420 180 L520 200 L680 90 L740 110' stroke='%23D4AF37' stroke-width='4' fill='none' stroke-linecap='round'/><g fill='%2310B981' opacity='0.75'><rect x='200' y='220' width='8' height='50' rx='2'/><line x1='204' y1='205' x2='204' y2='285' stroke='%2310B981' stroke-width='2'/><rect x='340' y='160' width='8' height='60' rx='2'/><line x1='344' y1='145' x2='344' y2='235' stroke='%2310B981' stroke-width='2'/><rect x='580' y='110' width='8' height='80' rx='2'/><line x1='584' y1='95' x2='584' y2='205' stroke='%2310B981' stroke-width='2'/></g><rect x='60' y='50' width='210' height='30' rx='8' fill='%23D4AF37' fill-opacity='0.2'/><text x='74' y='71' fill='%23FCD34D' font-family='system-ui, sans-serif' font-weight='bold' font-size='12' letter-spacing='1'>TRADING COMPETITION</text><text x='60' y='140' fill='%23FFFFFF' font-family='system-ui, sans-serif' font-weight='900' font-size='38' letter-spacing='-0.5'>TRADING SEMAKIN PEDE</text><text x='60' y='185' fill='url(%23goldGrad)' font-family='system-ui, sans-serif' font-weight='900' font-size='38' letter-spacing='-0.5'>COMPETITION 2026</text><text x='60' y='225' fill='%23E2E8F0' font-family='system-ui, sans-serif' font-size='15'>Kategori: Best Performance (Profit) &amp; Best Volume</text><rect x='60' y='265' width='230' height='36' rx='8' fill='%230A1628' stroke='%23D4AF37' stroke-width='1'/><text x='74' y='288' fill='%23FCD34D' font-family='system-ui, sans-serif' font-weight='bold' font-size='13'>Total Hadiah Rp 5.700.000</text><rect x='305' y='265' width='230' height='36' rx='8' fill='%230A1628' stroke='%231E293B' stroke-width='1'/><text x='319' y='288' fill='%2394A3B8' font-family='system-ui, sans-serif' font-size='13'>29 Okt 2026 (Daftar s.d 26 Okt)</text><g transform='translate(600, 160)'><path d='M20 70 L20 100 L60 100 L60 70 Z M0 20 L80 20 L70 65 L10 65 Z M-10 25 C -25 25, -25 50, 0 50 M90 25 C 105 25, 105 50, 80 50' fill='none' stroke='url(%23goldGrad)' stroke-width='4' stroke-linejoin='round'/><circle cx='40' cy='38' r='10' fill='url(%23goldGrad)' opacity='0.8'/></g><rect x='60' y='360' width='360' height='30' rx='6' fill='%23060E1B'/><text x='72' y='380' fill='%2364748B' font-family='system-ui, sans-serif' font-size='11'>Didukung Pialang Legal BAPPEBTI: TPFX &bull; Tanpa Biaya Pendaftaran</text></svg>";

        Event::updateOrCreate(
            ['id' => 'event-trading-competition-okt-2026'],
            [
                'poster_image' => $competitionPoster,
                'title' => 'Trading Semakin Pede Competition',
                'category' => 'Trading Competition',
                'status' => 'upcoming',
                'date' => 'Kamis, 29 Oktober 2026 (Pendaftaran s.d. 26 Oktober 2026)',
                'time' => 'Sesi London & New York (14.00 - 04.00 WIB)',
                'location' => 'Platform MetaTrader 5 (Didukung Pialang Resmi TPFX - BAPPEBTI)',
                'speaker' => 'Dewan Juri Mentor BAPPEBTI & Tim Riset Semakin Pede',
                'start_date' => '2026-10-29',
                'end_date' => '2026-10-29',
                'start_time' => '14:00',
                'end_time' => '04:00',
                'workshop_subtype' => 'competition',
                'prize_pool' => 'Rp 5.700.000',
                'registration_deadline' => '2026-10-26',
                'description' => 'Kompetisi trading berjangka komunitas Semakin Pede dengan total hadiah Rp 5.700.000 (5,7 Juta Rupiah). Pemenang terbagi menjadi 2 kategori utama: Best Performance (profit terbesar) dan Best Volume (volume lot transaksi terbanyak). Terbuka untuk seluruh member komunitas Semakin Pede.',
                'key_takeaways' => [
                    'Total Hadiah Rp 5.700.000 (5,7 Juta Rupiah)',
                    'Kategori Juara: Best Performance (Profit Terbesar)',
                    'Kategori Juara: Best Volume (Volume Lot Terbanyak)',
                    'Batas Akhir Pendaftaran: 26 Oktober 2026',
                    'Akun Kompetisi Resmi Didukung Pialang Legal BAPPEBTI: TPFX',
                ],
                'attendees_count' => null,
                'action_text' => 'Daftar Sekarang',
                'action_type' => 'rsvp',
                'telegram_group_url' => 'https://t.me/semakinpede_official',
                'tutorial_account_url' => 'https://drive.google.com/file/d/1kBVRqc8q6XcvHSdqVweg_Fc64Z_u79FV/view?usp=sharing',
            ]
        );

        // 3. Default Broker (TPFX)
        Broker::updateOrCreate(
            ['id' => 'broker-tpfx'],
            [
                'name' => 'PT Trijaya Pratama Futures (TPFX)',
                'short_name' => 'TPFX',
                'license_number' => 'No. 407/BAPPEBTI/SI/VII/2004',
                'status_badge' => 'Mitra Utama Resmi',
                'tagline' => 'Pialang Berjangka Terdaftar & Diawasi Resmi',
                'description' => 'TPFX adalah perusahaan pialang berjangka resmi di Indonesia yang menyediakan instrumen perdagangan komoditas berjangka (Gold, Oil, CPO) dengan infrastruktur eksekusi mutakhir serta transparansi penuh terhadap dana nasabah.',
                'highlights' => [
                    'Izin Usaha Pialang Berjangka BAPPEBTI: No. 407/BAPPEBTI/SI/VII/2004',
                    'Anggota Resmi Bursa Berjangka Jakarta (JFX) & ICDX',
                    'Penjaminan Transaksi via Kliring Berjangka Indonesia (KBI) & ICH',
                    'Rekening Terpisah (Segregated Account) di Bank BCA, Mandiri, BNI, CIMB Niaga',
                    'Pilihan Platform Transaksi: MetaTrader 4 & MetaTrader 5 (Desktop & Mobile)',
                    'Eksekusi Cepat dengan Dukungan Customer Support 24/5 Berbahasa Indonesia',
                ],
                'action_text' => 'Konsultasi Pendaftaran TPFX',
                'action_url' => 'https://wa.me/628176792110?text=Halo%20Admin%20Semakin%20Pede,%20saya%20ingin%20konsultasi%20pembukaan%20akun%20demo%20atau%20riil%20TPFX',
                'official_site_url' => 'https://bappebti.go.id',
                'is_featured' => true,
                'order' => 1,
            ]
        );

        // 4. Default Site Settings
        SiteSetting::updateOrCreate(
            ['id' => 1],
            [
                'project_title' => 'Semakin Pede',
                'project_tagline' => 'Komunitas Trader Futures Indonesia',
                'project_description' => 'Komunitas edukasi trading kontrak berjangka komoditi (Gold, Oil, CPO) Indonesia. Berfokus pada manajemen risiko, kepatuhan regulasi BAPPEBTI, dan analisis data pasar secara rasional.',
                'logo_url' => '',
                'social_media' => [
                    'whatsapp' => 'https://wa.me/628176792110?text=Halo%20Admin%20Semakin%20Pede',
                    'telegram' => 'https://t.me/semakinpede',
                    'instagram' => 'https://instagram.com/semakinpede',
                    'youtube' => 'https://youtube.com/@semakinpede',
                ],
            ]
        );

        // 5. Default Economic News (from JSON)
        $newsJsonPath = database_path('data/forexFactoryMediumHigh.json');
        if (File::exists($newsJsonPath)) {
            $rawNews = json_decode(File::get($newsJsonPath), true);
            if (is_array($rawNews)) {
                $days = ['Sunday' => 'Minggu', 'Monday' => 'Senin', 'Tuesday' => 'Selasa', 'Wednesday' => 'Rabu', 'Thursday' => 'Kamis', 'Friday' => 'Jumat', 'Saturday' => 'Sabtu'];
                $months = ['Jan' => 'Jan', 'Feb' => 'Feb', 'Mar' => 'Mar', 'Apr' => 'Apr', 'May' => 'Mei', 'Jun' => 'Jun', 'Jul' => 'Jul', 'Aug' => 'Agt', 'Sep' => 'Sep', 'Oct' => 'Okt', 'Nov' => 'Nov', 'Dec' => 'Des'];

                foreach (array_slice($rawNews, 0, 30) as $index => $item) {
                    $id = 'ff-news-'.md5(($item['title'] ?? '').($item['date'] ?? '').$index);
                    $dateObj = null;
                    $timeFormatted = 'Terkini';
                    $dateFormatted = '';
                    $dayName = 'Hari Ini';

                    try {
                        if (! empty($item['date'])) {
                            $dateObj = new \DateTime($item['date']);
                            $timeFormatted = $dateObj->format('H:i').' WIB';
                            $dayEng = $dateObj->format('l');
                            $dayName = $days[$dayEng] ?? $dayEng;
                            $mEng = $dateObj->format('M');
                            $mInd = $months[$mEng] ?? $mEng;
                            $dateFormatted = $dateObj->format('d ').$mInd.$dateObj->format(' Y');
                        }
                    } catch (\Exception $e) {
                        // ignore date parse error
                    }

                    EconomicNews::updateOrCreate(
                        ['id' => $id],
                        [
                            'title' => $item['title'] ?? 'Economic Release',
                            'country' => $item['country'] ?? 'USD',
                            'date_raw' => $item['date'] ?? null,
                            'time_formatted' => $timeFormatted,
                            'date_formatted' => $dateFormatted,
                            'day_name' => $dayName,
                            'impact' => ($item['impact'] ?? '') === 'High' ? 'High' : 'Medium',
                            'forecast' => $item['forecast'] ?? '-',
                            'previous' => $item['previous'] ?? '-',
                            'source' => 'ForexFactory.com',
                        ]
                    );
                }
            }
        }
    }
}
