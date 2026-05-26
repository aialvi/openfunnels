<?php

namespace App\Mail;

use App\Models\Contact;
use App\Models\ContactSubmission;
use App\Models\Funnel;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewLeadCaptured extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Contact $contact,
        public Funnel $funnel,
        public ContactSubmission $submission,
    ) {}

    public function build(): self
    {
        return $this
            ->subject('New lead captured: '.$this->contact->email)
            ->text('emails.new-lead-captured');
    }
}
