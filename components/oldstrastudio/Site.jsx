export default function Site() {

    const array = [
        '1q93',
        'A Brief Glance',
        'ATTICO',
        'Carhartt',
        'Equ',
        'Estate Italiana',
        'Fibra1',
        'Frah Quintale',
        'Giannasi Milano',
        'Laura Baresi Knit Design',
        'Let Me',
        'Limitless Dublin',
        'Linneo',
        'Lentee',
        'Mainetti Real Estate',
        'Manea Lab&Shop',
        'Merio',
        'Mf Medical Fisio',
        'Oltre Booking Agency',
        'Omb Saleri s.p.a.',
        'One Block Down',
        'Pj Ceramiche',
        'Poliambulatorio Ptc',
        'Posta Cycling CO',
        'Silver Ostrich',
        'Spz — Spazio',
        'Studio Minopoli',
        'Taio Racing Parts',
        'The Poke Zone',
        'Torrefazione Gran Salvador',
        'Vans',
    ]

    return (
        <div>
            <h1 className="text-6xl text-white">
                CLIENTS ↓
                <br />
                <br />
            </h1>
            {
                array.map(i => (
                    <h1 key={i} className="text-5xl text-white">
                        {i}
                    </h1>
                ))
            }
        </div>
    )
}
