import os
import django
from django.utils import timezone
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Store2.settings')
django.setup()

from products.models import Category, Brand, Product, ProductImage, SaleEvent, ProductSale
from accounts.models import User
from auctions.models import Auction, AuctionStatus
from datetime import timedelta

def populate():
    print("Starting data population...")
    
    # 1. Get a superuser for any required fields
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        print("No superuser found. Please run 'python manage.py createsuperuser' first.")
        return

    # 2. Create Brands
    brands_data = [
        {'name': 'TechNova', 'logo': 'brands/technova.png'},
        {'name': 'EliteStyle', 'logo': 'brands/elitestyle.png'},
    ]
    
    brands = {}
    for b_data in brands_data:
        brand, created = Brand.objects.get_or_create(name=b_data['name'], defaults={'logo': b_data['logo']})
        brands[b_data['name']] = brand
        print(f"Brand: {brand.name} ({'Created' if created else 'Exists'})")

    # 3. Create Categories (Parent & Children)
    categories_structure = {
        'Electronics': {
            'name_ar': 'إلكترونيات',
            'logo': 'categories/electronics.png',
            'children': [
                {'en': 'Smartphones', 'ar': 'هواتف ذكية'},
                {'en': 'Laptops', 'ar': 'أجهزة لابتوب'},
                {'en': 'Audio', 'ar': 'صوتيات'},
            ]
        },
        'Fashion': {
            'name_ar': 'أزياء',
            'logo': 'categories/fashion.png',
            'children': [
                {'en': 'Footwear', 'ar': 'أحذية'},
                {'en': 'Apparel', 'ar': 'ملابس'},
            ]
        },
        'Home & Kitchen': {
            'name_ar': 'المنزل والمطبخ',
            'logo': 'categories/home.png',
            'children': [
                {'en': 'Appliances', 'ar': 'أجهزة منزلية'},
                {'en': 'Furniture', 'ar': 'أثاث'},
            ]
        }
    }

    category_map = {}
    for p_en, p_data in categories_structure.items():
        parent, created = Category.objects.get_or_create(
            name_en=p_en, 
            defaults={'name_ar': p_data['name_ar'], 'logo': p_data['logo']}
        )
        print(f"Parent Category: {p_en}")
        
        for child in p_data['children']:
            c_obj, c_created = Category.objects.get_or_create(
                name_en=child['en'],
                parent=parent,
                defaults={'name_ar': child['ar']}
            )
            category_map[child['en']] = c_obj
            print(f"  Child Category: {child['en']}")

    # 4. Create Products
    products_data = [
        {
            'name_en': 'NovaPhone Pro X',
            'name_ar': 'نوفا فون برو X',
            'category': 'Smartphones',
            'brand': 'TechNova',
            'price': 999.99,
            'quantity': 50,
            'desc_en': 'The ultimate flagship smartphone with edge-to-edge display.',
            'desc_ar': 'الهاتف الرائد الأفضل مع شاشة كاملة من الحافة إلى الحافة.',
            'image': 'products/smartphone.png'
        },
        {
            'name_en': 'UltraBook 15',
            'name_ar': 'ألترا بوك 15',
            'category': 'Laptops',
            'brand': 'TechNova',
            'price': 1299.00,
            'quantity': 25,
            'desc_en': 'High performance laptop for professionals and creators.',
            'desc_ar': 'لابتوب عالي الأداء للمحترفين والمبدعين.',
            'image': 'products/laptop.png'
        },
        {
            'name_en': 'SonicBoom Headphones',
            'name_ar': 'سماعات سونيك بوم',
            'category': 'Audio',
            'brand': 'TechNova',
            'price': 199.50,
            'quantity': 100,
            'desc_en': 'Premium noise-cancelling studio headphones.',
            'desc_ar': 'سماعات استوديو فاخرة مع ميزة إلغاء الضوضاء.',
            'image': 'products/headphones.png'
        },
        {
            'name_en': 'Elite Runner Sneakers',
            'name_ar': 'حذاء نخبوي للجري',
            'category': 'Footwear',
            'brand': 'EliteStyle',
            'price': 149.00,
            'quantity': 80,
            'desc_en': 'Durable and stylish sneakers for maximum performance.',
            'desc_ar': 'أحذية رياضية متينة وأنيقة لأقصى أداء.',
            'image': 'products/sneakers.png'
        },
        {
            'name_en': 'MasterBarista Espresso Machine',
            'name_ar': 'ماكينة إسبريسو ماستر باريستا',
            'category': 'Appliances',
            'brand': 'EliteStyle',
            'price': 450.00,
            'quantity': 15,
            'desc_en': 'Professional coffee maker for your home kitchen.',
            'desc_ar': 'صانعة قهوة احترافية لمطبخك المنزلي.',
            'image': 'products/coffee_machine.png'
        }
    ]

    created_products = []
    for p_data in products_data:
        product = Product.objects.filter(name_en=p_data['name_en']).first()
        if not product:
            product = Product.objects.create(
                name_en=p_data['name_en'],
                name_ar=p_data['name_ar'],
                category=category_map[p_data['category']],
                brand=brands.get(p_data['brand']),
                price=Decimal(str(p_data['price'])),
                quantity=p_data['quantity'],
                description_en=p_data['desc_en'],
                description_ar=p_data['desc_ar'],
                rating=Decimal('4.5')
            )
            ProductImage.objects.get_or_create(product=product, image=p_data['image'])
            print(f"Product: {product.name_en} (Created)")
        else:
            print(f"Product: {product.name_en} (Exists)")
        created_products.append(product)

    # 5. Create Sale Event and Product Sales
    now = timezone.now()
    sale_event, created = SaleEvent.objects.get_or_create(
        name_en="Spring Flash Sale",
        defaults={
            'name_ar': "تخفيضات الربيع الكبرى",
            'description_en': "Unbeatable prices on all categories!",
            'description_ar': "أسعار لا تقبل المنافسة على جميع الفئات!",
            'start_date': now - timedelta(days=1),
            'end_date': now + timedelta(days=7),
            'created_by': admin_user,
            'is_active': True
        }
    )
    if created:
        print(f"Sale Event: {sale_event.name_en} (Created)")
        # Add a few products to the sale
        for product in created_products[:3]:
            ProductSale.objects.get_or_create(
                product=product,
                sale_event=sale_event,
                defaults={
                    'discount_percentage': Decimal('20.00'),
                    'start_date': sale_event.start_date,
                    'end_date': sale_event.end_date,
                    'is_active': True
                }
            )
            print(f"  Applied 20% discount to: {product.name_en}")

    # 6. Create Auctions
    auctions_data = [
        {
            'title': 'Rare Collector Edition Smartphone',
            'product': created_products[0],
            'start_price': 1200.00,
            'desc': 'A rare collector edition of the NovaPhone Pro X.'
        },
        {
            'title': 'Limited Edition Elite Sneakers',
            'product': created_products[3],
            'start_price': 300.00,
            'desc': 'Hand-signed limited edition sneakers.'
        }
    ]

    for a_data in auctions_data:
        auction, created = Auction.objects.get_or_create(
            title=a_data['title'],
            defaults={
                'product': a_data['product'],
                'description': a_data['desc'],
                'start_price': Decimal(str(a_data['start_price'])),
                'start_at': now - timedelta(hours=1),
                'end_at': now + timedelta(days=2),
                'status': AuctionStatus.ACTIVE,
                'quantity': 1
            }
        )
        print(f"Auction: {auction.title} ({'Created' if created else 'Exists'})")

    print("Data population complete!")

if __name__ == '__main__':
    populate()
