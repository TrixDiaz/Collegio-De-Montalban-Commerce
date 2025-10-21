
const GallerySection = () => {
    const galleryImages = [
        {
            id: '1',
            src: '/images/interior-tile.jpg',
            alt: 'Interior Tile Design',
            title: 'Modern Interior Tile',
        },
        {
            id: '2',
            src: '/images/white-tile.jpg',
            alt: 'White Tile Pattern',
            title: 'Classic White Tile',
        },
        {
            id: '3',
            src: '/images/wood-tile.jpg',
            alt: 'Wood Tile Texture',
            title: 'Natural Wood Tile',
        },
        {
            id: '4',
            src: '/images/interior-tile.jpg',
            alt: 'Interior Tile Design 2',
            title: 'Luxury Interior Tile',
        },
        {
            id: '5',
            src: '/images/white-tile.jpg',
            alt: 'White Tile Pattern 2',
            title: 'Subway White Tile',
        },
        {
            id: '6',
            src: '/images/wood-tile.jpg',
            alt: 'Wood Tile Texture 2',
            title: 'Rustic Wood Tile',
        },
    ];

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Our Tile Gallery</h2>
                <p className="text-muted-foreground">Explore our premium tile collection</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryImages.map((image) => (
                    <div key={image.id} className="group relative overflow-hidden rounded-lg shadow-lg">
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                            <div className="p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="font-semibold text-lg">{image.title}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export { GallerySection }