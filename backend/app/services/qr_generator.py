import qrcode
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from app.core.config import settings
from app.services.local_storage import local_storage
from typing import Optional
import os

class QRGenerator:
    def __init__(self):
        self.base_url = settings.BASE_URL

    async def generate_qr_code(
        self,
        story_id: str,
        format: str = "png",
        size: int = 512
    ) -> str:
        """
        Generar código QR para un relato

        Args:
            story_id: ID del relato
            format: Formato de salida (png, svg)
            size: Tamaño del QR en píxeles

        Returns:
            URL pública del QR generado
        """
        try:
            # URL del relato
            story_url = f"{self.base_url}/story/{story_id}"

            # Crear QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_H,
                box_size=10,
                border=4,
            )
            qr.add_data(story_url)
            qr.make(fit=True)

            # Generar imagen
            img = qr.make_image(fill_color="black", back_color="white")

            # Redimensionar si es necesario
            if img.size[0] != size:
                img = img.resize((size, size), Image.Resampling.LANCZOS)

            # Convertir a bytes
            img_bytes = BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)

            # Guardar en almacenamiento local
            qr_url = await local_storage.upload_qr(
                img_bytes.getvalue(),
                story_id
            )

            return qr_url

        except Exception as e:
            print(f"Error generando QR: {e}")
            raise Exception(f"Failed to generate QR code: {str(e)}")

    async def generate_printable_qr(
        self,
        story_id: str,
        story_title: str,
        narrator_name: str,
        community: str
    ) -> str:
        """
        Generar versión imprimible del QR con información del relato

        Args:
            story_id: ID del relato
            story_title: Título del relato
            narrator_name: Nombre del narrador
            community: Comunidad del narrador

        Returns:
            URL pública del QR imprimible
        """
        try:
            # URL del relato
            story_url = f"{self.base_url}/story/{story_id}"

            # Crear QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_H,
                box_size=10,
                border=2,
            )
            qr.add_data(story_url)
            qr.make(fit=True)

            # Generar imagen del QR
            qr_img = qr.make_image(fill_color="black", back_color="white")
            qr_img = qr_img.resize((400, 400), Image.Resampling.LANCZOS)

            # Crear canvas más grande para incluir información
            canvas_width = 600
            canvas_height = 700
            canvas = Image.new('RGB', (canvas_width, canvas_height), 'white')

            # Pegar QR en el centro-superior
            qr_x = (canvas_width - 400) // 2
            qr_y = 50
            canvas.paste(qr_img, (qr_x, qr_y))

            # Agregar texto
            draw = ImageDraw.Draw(canvas)

            # Intentar usar fuente del sistema, si no usar default
            try:
                title_font = ImageFont.truetype("arial.ttf", 24)
                text_font = ImageFont.truetype("arial.ttf", 18)
                small_font = ImageFont.truetype("arial.ttf", 14)
            except:
                title_font = ImageFont.load_default()
                text_font = ImageFont.load_default()
                small_font = ImageFont.load_default()

            # Título (centrado)
            title_text = story_title[:60] + "..." if len(story_title) > 60 else story_title
            title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
            title_width = title_bbox[2] - title_bbox[0]
            title_x = (canvas_width - title_width) // 2
            draw.text((title_x, 470), title_text, fill='black', font=title_font)

            # Narrador
            narrator_text = f"Narrado por: {narrator_name}"
            narrator_bbox = draw.textbbox((0, 0), narrator_text, font=text_font)
            narrator_width = narrator_bbox[2] - narrator_bbox[0]
            narrator_x = (canvas_width - narrator_width) // 2
            draw.text((narrator_x, 510), narrator_text, fill='#333333', font=text_font)

            # Comunidad
            community_text = f"Comunidad: {community}"
            community_bbox = draw.textbbox((0, 0), community_text, font=text_font)
            community_width = community_bbox[2] - community_bbox[0]
            community_x = (canvas_width - community_width) // 2
            draw.text((community_x, 540), community_text, fill='#333333', font=text_font)

            # Instrucciones
            instruction_text = "Escanea el código para escuchar la historia"
            instruction_bbox = draw.textbbox((0, 0), instruction_text, font=small_font)
            instruction_width = instruction_bbox[2] - instruction_bbox[0]
            instruction_x = (canvas_width - instruction_width) // 2
            draw.text((instruction_x, 590), instruction_text, fill='#666666', font=small_font)

            # Logo/Marca del proyecto
            brand_text = "Historias Vivientes Aymara"
            brand_bbox = draw.textbbox((0, 0), brand_text, font=small_font)
            brand_width = brand_bbox[2] - brand_bbox[0]
            brand_x = (canvas_width - brand_width) // 2
            draw.text((brand_x, 620), brand_text, fill='#1976d2', font=small_font)

            # Convertir a bytes
            img_bytes = BytesIO()
            canvas.save(img_bytes, format='PNG', quality=95)
            img_bytes.seek(0)

            # Guardar en almacenamiento local
            qr_url = await local_storage.upload_qr(
                img_bytes.getvalue(),
                story_id,
                "_printable"
            )

            return qr_url

        except Exception as e:
            print(f"Error generando QR imprimible: {e}")
            raise Exception(f"Failed to generate printable QR: {str(e)}")

# Singleton instance
qr_generator = QRGenerator()
