import { Button, Stack, TextField, Grid, MenuItem, Alert } from "@mui/material";
import { useState, useMemo } from "react";
import type { BasicInfo } from "../type";
import { updatePartialSettings } from "../stores";

type BasicInfoTabProps = {
	initialData: BasicInfo;
};

const LANGUAGES = [{ value: 'ms-MY', label: 'Bahasa Malaysia' }, { value: 'en-US', label: 'English (US)' }, { value: 'zh-CN', label: '中文 (简体)' }];
const TIMEZONES = [{ value: 'Asia/Kuala_Lumpur', label: 'Asia/Kuala_Lumpur' }, { value: 'Asia/Shanghai', label: 'Asia/Shanghai' }];


type Errors = Partial<Record<keyof BasicInfo, string>>;

function validateBasicInfo(values: BasicInfo): Errors {
	const errors: Errors = {};
	
	if (!values.name) {
		errors.name = 'School Name is required';
	}
	if (!values.currentAcademicYear) {
		errors.currentAcademicYear = 'Academic Year is required';
	}
	if (!values.timezone) {
		errors.timezone = 'Timezone is required';
	}
	if (!values.language) {
		errors.language = 'Language is required';
	}
	
	return errors;
}

export default function BasicInfoTab({ initialData }: BasicInfoTabProps) {
	const [formData, setFormData] = useState<BasicInfo>(initialData);
	
	const [errors, setErrors] = useState<Errors>({});
	
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		if (errors[name as keyof BasicInfo]) {
			setErrors(prev => ({ ...prev, [name]: undefined }));
		}
	};

	const isDirty = useMemo(() => {
		if (!initialData) return true; 
		return JSON.stringify(initialData) !== JSON.stringify(formData);
	}, [initialData, formData]);


	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaveStatus(null);

		const validationErrors = validateBasicInfo(formData);
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length > 0) {
			return;
		}

		setIsSubmitting(true);
		try {
			await updatePartialSettings('basicInfo', formData);
			setSaveStatus('success');

			setTimeout(() => setSaveStatus(null), 3000);
		} catch (e) {
			setSaveStatus('error');
		} finally {
			setIsSubmitting(false);
		}
	};

	// 重置处理函数
	const handleReset = () => {
		setFormData(initialData);
		setErrors({});
	};

	return (
		<form onSubmit={handleSubmit}>
			<Stack spacing={4}>
				{saveStatus === 'success' && <Alert severity="success">Basic Information saved successfully!</Alert>}
				{saveStatus === 'error' && <Alert severity="error">Failed to save Basic Information.</Alert>}
				
				<Grid container spacing={4}>
					<Grid size={6}> 
						<TextField
							fullWidth
							label="School Name *"
							name="name"
							value={formData.name}
							onChange={handleChange}
							error={Boolean(errors.name)}
							helperText={errors.name}
						/>
					</Grid>
					<Grid size={6}>
						<TextField
							fullWidth
							label="Current Academic Year *"
							name="currentAcademicYear"
							value={formData.currentAcademicYear}
							onChange={handleChange}
							error={Boolean(errors.currentAcademicYear)}
							helperText={errors.currentAcademicYear}
						/>
					</Grid>

					<Grid size={6}> 
						<TextField
							fullWidth
							label="Address"
							name="address"
							multiline
							rows={3}
							value={formData.address}
							onChange={handleChange}
						/>
					</Grid>

					<Grid size={6}>
						<TextField
							select
							fullWidth
							label="Timezone *"
							name="timezone"
							value={formData.timezone}
							onChange={handleChange}
							error={Boolean(errors.timezone)}
							helperText={errors.timezone}
						>
							{TIMEZONES.map((option) => (<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>))}
						</TextField>
					</Grid>
					<Grid size={6}>
						<TextField
							select
							fullWidth
							label="Language *"
							name="language"
							value={formData.language}
							onChange={handleChange}
							error={Boolean(errors.language)}
							helperText={errors.language}
						>
							{LANGUAGES.map((option) => (<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>))}
						</TextField>
					</Grid>
				</Grid>

				<Stack direction="row" justifyContent="flex-end" spacing={2}>
					<Button onClick={handleReset} disabled={isSubmitting}>
						Reset
					</Button>
					<Button type="submit" variant="contained" disabled={isSubmitting || !isDirty}>
						{isSubmitting ? 'Saving...' : 'Save Configuration'}
					</Button>
				</Stack>
			</Stack>
		</form>
	);
}