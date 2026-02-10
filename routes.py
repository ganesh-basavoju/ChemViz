import io
import json
from datetime import datetime

import pandas as pd
from flask import session, request, jsonify, send_file, send_from_directory
from flask_login import current_user
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

from app import app, db
from models import Dataset, EquipmentData
from replit_auth import require_login, make_replit_blueprint

app.register_blueprint(make_replit_blueprint(), url_prefix="/auth")


@app.before_request
def make_session_permanent():
    session.permanent = True


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/auth/status')
def auth_status():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'email': current_user.email,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name,
                'profile_image_url': current_user.profile_image_url,
            }
        })
    return jsonify({'authenticated': False})


@app.route('/api/upload', methods=['POST'])
@require_login
def upload_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Only CSV files are accepted'}), 400

    try:
        df = pd.read_csv(file)

        required_cols = ['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            return jsonify({'error': f'Missing columns: {", ".join(missing)}'}), 400

        df['Flowrate'] = pd.to_numeric(df['Flowrate'], errors='coerce')
        df['Pressure'] = pd.to_numeric(df['Pressure'], errors='coerce')
        df['Temperature'] = pd.to_numeric(df['Temperature'], errors='coerce')
        df = df.dropna(subset=['Flowrate', 'Pressure', 'Temperature'])

        type_dist = df['Type'].value_counts().to_dict()

        dataset = Dataset(
            user_id=current_user.id,
            filename=file.filename,
            total_count=len(df),
            avg_flowrate=round(df['Flowrate'].mean(), 2),
            avg_pressure=round(df['Pressure'].mean(), 2),
            avg_temperature=round(df['Temperature'].mean(), 2),
            type_distribution=json.dumps(type_dist),
        )
        db.session.add(dataset)
        db.session.flush()

        for _, row in df.iterrows():
            eq = EquipmentData(
                dataset_id=dataset.id,
                equipment_name=row['Equipment Name'],
                equipment_type=row['Type'],
                flowrate=float(row['Flowrate']),
                pressure=float(row['Pressure']),
                temperature=float(row['Temperature']),
            )
            db.session.add(eq)

        user_datasets = Dataset.query.filter_by(user_id=current_user.id).order_by(Dataset.uploaded_at.desc()).all()
        if len(user_datasets) > 5:
            for old_ds in user_datasets[5:]:
                db.session.delete(old_ds)

        db.session.commit()

        return jsonify({
            'success': True,
            'dataset_id': dataset.id,
            'summary': {
                'total_count': dataset.total_count,
                'avg_flowrate': dataset.avg_flowrate,
                'avg_pressure': dataset.avg_pressure,
                'avg_temperature': dataset.avg_temperature,
                'type_distribution': type_dist,
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/datasets')
@require_login
def get_datasets():
    datasets = Dataset.query.filter_by(user_id=current_user.id).order_by(Dataset.uploaded_at.desc()).limit(5).all()
    result = []
    for ds in datasets:
        result.append({
            'id': ds.id,
            'filename': ds.filename,
            'uploaded_at': ds.uploaded_at.isoformat(),
            'total_count': ds.total_count,
            'avg_flowrate': ds.avg_flowrate,
            'avg_pressure': ds.avg_pressure,
            'avg_temperature': ds.avg_temperature,
            'type_distribution': json.loads(ds.type_distribution),
        })
    return jsonify(result)


@app.route('/api/datasets/<int:dataset_id>')
@require_login
def get_dataset(dataset_id):
    ds = Dataset.query.filter_by(id=dataset_id, user_id=current_user.id).first()
    if not ds:
        return jsonify({'error': 'Dataset not found'}), 404

    equipment = EquipmentData.query.filter_by(dataset_id=ds.id).all()
    eq_list = [{
        'id': e.id,
        'equipment_name': e.equipment_name,
        'equipment_type': e.equipment_type,
        'flowrate': e.flowrate,
        'pressure': e.pressure,
        'temperature': e.temperature,
    } for e in equipment]

    type_dist = json.loads(ds.type_distribution)

    type_stats = {}
    for e in equipment:
        t = e.equipment_type
        if t not in type_stats:
            type_stats[t] = {'flowrates': [], 'pressures': [], 'temps': []}
        type_stats[t]['flowrates'].append(e.flowrate)
        type_stats[t]['pressures'].append(e.pressure)
        type_stats[t]['temps'].append(e.temperature)

    type_averages = {}
    for t, vals in type_stats.items():
        type_averages[t] = {
            'avg_flowrate': round(sum(vals['flowrates']) / len(vals['flowrates']), 2),
            'avg_pressure': round(sum(vals['pressures']) / len(vals['pressures']), 2),
            'avg_temperature': round(sum(vals['temps']) / len(vals['temps']), 2),
            'count': len(vals['flowrates']),
        }

    return jsonify({
        'id': ds.id,
        'filename': ds.filename,
        'uploaded_at': ds.uploaded_at.isoformat(),
        'total_count': ds.total_count,
        'avg_flowrate': ds.avg_flowrate,
        'avg_pressure': ds.avg_pressure,
        'avg_temperature': ds.avg_temperature,
        'type_distribution': type_dist,
        'type_averages': type_averages,
        'equipment': eq_list,
    })


@app.route('/api/datasets/<int:dataset_id>/delete', methods=['DELETE'])
@require_login
def delete_dataset(dataset_id):
    ds = Dataset.query.filter_by(id=dataset_id, user_id=current_user.id).first()
    if not ds:
        return jsonify({'error': 'Dataset not found'}), 404
    db.session.delete(ds)
    db.session.commit()
    return jsonify({'success': True})


@app.route('/api/datasets/<int:dataset_id>/report')
@require_login
def generate_report(dataset_id):
    ds = Dataset.query.filter_by(id=dataset_id, user_id=current_user.id).first()
    if not ds:
        return jsonify({'error': 'Dataset not found'}), 404

    equipment = EquipmentData.query.filter_by(dataset_id=ds.id).all()
    type_dist = json.loads(ds.type_distribution)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5 * inch, bottomMargin=0.5 * inch)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Title'],
        fontSize=22, spaceAfter=20, textColor=colors.HexColor('#1a3a5c')
    )
    heading_style = ParagraphStyle(
        'CustomHeading', parent=styles['Heading2'],
        fontSize=14, spaceAfter=10, textColor=colors.HexColor('#2c5f8a'),
        spaceBefore=15
    )
    body_style = ParagraphStyle(
        'CustomBody', parent=styles['Normal'],
        fontSize=10, spaceAfter=6
    )

    elements = []

    elements.append(Paragraph("Chemical Equipment Analysis Report", title_style))
    elements.append(Paragraph(f"File: {ds.filename}", body_style))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", body_style))
    elements.append(Spacer(1, 15))

    elements.append(Paragraph("Summary Statistics", heading_style))
    summary_data = [
        ['Metric', 'Value'],
        ['Total Equipment', str(ds.total_count)],
        ['Avg Flowrate', f'{ds.avg_flowrate:.2f}'],
        ['Avg Pressure', f'{ds.avg_pressure:.2f}'],
        ['Avg Temperature', f'{ds.avg_temperature:.2f}'],
    ]
    summary_table = Table(summary_data, colWidths=[3 * inch, 3 * inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a3a5c')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f0f5fa')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#c0d0e0')),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 15))

    elements.append(Paragraph("Equipment Type Distribution", heading_style))
    dist_data = [['Type', 'Count']]
    for t, c in type_dist.items():
        dist_data.append([t, str(c)])
    dist_table = Table(dist_data, colWidths=[3 * inch, 3 * inch])
    dist_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5f8a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f5f8fc')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#c0d0e0')),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ]))
    elements.append(dist_table)
    elements.append(Spacer(1, 15))

    elements.append(Paragraph("Equipment Details", heading_style))
    eq_data = [['Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']]
    for e in equipment:
        eq_data.append([
            e.equipment_name, e.equipment_type,
            f'{e.flowrate:.1f}', f'{e.pressure:.1f}', f'{e.temperature:.1f}'
        ])
    eq_table = Table(eq_data, colWidths=[1.4 * inch, 1.4 * inch, 1.1 * inch, 1.1 * inch, 1.1 * inch])
    eq_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a3a5c')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#c0d0e0')),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f5fa')]),
    ]))
    elements.append(eq_table)

    doc.build(elements)
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'equipment_report_{ds.filename.replace(".csv", "")}.pdf'
    )


@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')
