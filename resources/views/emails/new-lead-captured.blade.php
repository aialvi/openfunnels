New lead captured

Funnel: {{ $funnel->name }}
Email: {{ $contact->email }}
Name: {{ $contact->name ?: 'Not provided' }}
Phone: {{ $contact->phone ?: 'Not provided' }}
Status: {{ $contact->status }}
Submission count: {{ data_get($contact->metadata, 'submission_count', 1) }}

Submitted fields:
@foreach (($submission->fields ?? []) as $key => $value)
- {{ $key }}: {{ is_scalar($value) ? $value : json_encode($value) }}
@endforeach

Source URL: {{ $submission->url ?: 'Not available' }}
